import { defineStore } from "pinia";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { useUserSessionStore } from "./usersession";
import UserService from "@/services/userService";
import jwt_decode from 'jwt-decode'
import { DateTime } from 'luxon'
import store from "store";
import router from "@/router";

const authConfig = {
  auth: {
    clientId: import.meta.env.VITE_AAD_CLIEND_ID,
    authority: import.meta.env.VITE_AAD_AUTHORITY,
    responseMode: "query",
    redirectUri: import.meta.env.VITE_AAD_REDIRECT_URL,
    postLogoutRedirectUri: import.meta.env.VITE_LOGOUT_URL
  },
};

const requestScope = {
  scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
};

export const useAuthStore = defineStore("auth", {
  state: () => {
    const userSessionStore = useUserSessionStore()
    return {
      currentUser: userSessionStore.userSession,
      account: null as AccountInfo | null,
      msalInstance: new PublicClientApplication(authConfig),
      accessToken: "",
      accessTokenUpdatedOn: new Date(),
      accessTokenValidation: null as any,
      redirectAfterLogin: '/dashboard'      
    }
  },
  actions: {
    async aquireToken() {
      // 1. try to obtain token use account detaials
      await this.getAccount();
      // 2. try to obtain token if the user had already logged in
      let tokenResponse = await this.msalInstance.handleRedirectPromise();
      if (tokenResponse) {
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalInstance.getAllAccounts()[0];
      }
      // if the the user is logged in
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse);
      }
    },
    async acquireTokenSilent() {
      // 1. try to obtain token use account detaials
      await this.getAccount()
      const accessTokenRequest = {
        scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
        account: this.msalInstance.getAllAccounts()[0]
      }
      console.info('acquireTokenSilent')
      const tokenResponse = await this.msalInstance.acquireTokenSilent(accessTokenRequest)
      if (tokenResponse) {
        this.account = tokenResponse.account
      } else {
        this.account = this.msalInstance.getAllAccounts()[0]
      }
      // if the the user is logged in
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse)
      }
    },
    async getAccount() {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length == 0) {
        console.log("no logged in account detected");
        return;
      }
      this.account = accounts[0];
    },

    async login() {
      try {
       
          let tokenResponse = await this.msalInstance.handleRedirectPromise();
          const accessTokenRequest = {
            scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
            account: this.msalInstance.getAllAccounts()[0],
          };
          console.log("accessTokenRequest" + accessTokenRequest);
          if (tokenResponse) {
            this.account = tokenResponse.account;
          } else {
            this.account = this.msalInstance.getAllAccounts()[0];
          }

          if (this.account && tokenResponse) {
            console.log(
              "[Auth Store] successgully obtained valid account and tokenResponse"
            );
            await this.updateUserStore(tokenResponse);
          } else if (this.account) {
            console.log("[Auth Store] User has logged in, but no tokens.");
            try {
              tokenResponse = await this.msalInstance.acquireTokenSilent(
                accessTokenRequest
              );
              await this.updateUserStore(tokenResponse);
            } catch (err) {
              await this.msalInstance.acquireTokenRedirect(requestScope);
            }
          } else {
            console.log(
              "[Auth Store]  No account or tokenResponse present. User must now login."
            );
            await this.msalInstance.loginRedirect(requestScope);
          }
       
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
      }
    },
    async logout() {
      this.currentUser.isLoggedIn = false;
      localStorage.clear();
      sessionStorage.clear();
      await this.msalInstance
        .logoutRedirect({ postLogoutRedirectUri: "/" })
        .then(() => {
          console.log("logout successful");

        })
        .catch((error) => {
          console.error(error);
        });
    },
    async updateUserStore(tokenResponse: any) {
      this.currentUser.isLoggedIn = true;
      console.log("updating user Store with " + tokenResponse);
      this.accessToken = tokenResponse.accessToken;
      localStorage.setItem("token", this.accessToken);
      const user = await UserService.getUserClaimInfo();
      if (user !== null) {
        this.currentUser = {...this.currentUser,...user} as any;
        console.log("currentUser:" +  JSON.stringify(this.currentUser));
        localStorage.setItem("userType", this.currentUser.userType);
        store.set('currentUser', this.currentUser);
        if (!this.currentUser.roleKey) {
          router.push("/error");
        }
      }
    },
    validateToken() {
      console.info(` -- Clearing Interval `)
      clearInterval(this.accessTokenValidation)
      this.accessTokenValidation = setInterval(() => {
        console.log('interval running')
        const token: any = jwt_decode(this.accessToken)
        const currentTime = DateTime.fromJSDate(new Date())
        const tokenExpTime = DateTime.fromMillis(token.exp * 1000)
        const diff = currentTime.diff(tokenExpTime, ['minutes']).minutes
        if (diff > -5) {
          console.log(` -- Token will expire in few minutes hence refeshning  ${currentTime} ${tokenExpTime}  ${diff}`)


          const accessTokenUpdatedOn = DateTime.fromJSDate(this.accessTokenUpdatedOn)
          const diffs = currentTime.diff(accessTokenUpdatedOn, ['hours']).hours

          if (diffs > 3) {
            console.log(` -- User Idle for Long Time - ${diffs}  Hence reloading `)
            location.reload()
          }
          this.acquireTokenSilent()
        }
      }, 5000)
    },
  }
});
