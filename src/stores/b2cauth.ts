import { defineStore } from "pinia";
import {
  EventType,
  PublicClientApplication,
  type AccountInfo
} from "@azure/msal-browser";
import { userB2CSessionStore } from "@/stores/userb2csession";
import UserService from "@/services/userService";
import jwt_decode from 'jwt-decode'
import { DateTime } from 'luxon'
import router from "@/router";
import store from "store";

const authB2CConfig = {
  auth: {
    clientId: import.meta.env.VITE_B2C_CLIENT_ID,
    authority: import.meta.env.VITE_B2C_AUTHORITY,
    knownAuthorities: [import.meta.env.VITE_B2C_KNOWN_AUTHORITY],
    redirectUri: import.meta.env.VITE_B2C_REDIRECT_URL,
    postLogoutRedirectUri: import.meta.env.VITE_LOGOUT_URL,
    navigateToLoginRequestUrl: true,
  },
};
const requestScope = {
  scopes: ["openid", "profile", "email", import.meta.env.VITE_B2C_TOKEN_SCOPE],
};
export const useB2CAuthStore = defineStore("b2cauth", {
  state: () => {
    const userb2cSessionStore = userB2CSessionStore()
    return {
      msalB2cInstance: new PublicClientApplication(authB2CConfig),
      accessToken: "",
      currentB2CUser: userb2cSessionStore.userB2CSession,
      account: null as AccountInfo | null,
      accessTokenUpdatedOn: new Date(),
      accessTokenValidation: null as any,
      redirectAfterLogin: '/dashboard',
      decodedToken: {},
      isValidIdentityProvider: false,
    }
  },
  actions: {
    async aquireToken() {
      await this.getAccount();
      let tokenResponse = await this.msalB2cInstance.handleRedirectPromise();
      if (tokenResponse) {
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalB2cInstance.getAllAccounts()[0];
      }
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse);
      }
    },
    async acquireTokenSilent() {
      await this.getAccount()
      const accessTokenRequest = {
        scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
        account: this.msalB2cInstance.getAllAccounts()[0]
      }
      console.info('acquireTokenSilent')
      const tokenResponse = await this.msalB2cInstance.acquireTokenSilent(accessTokenRequest)
      if (tokenResponse) {
        this.account = tokenResponse.account
      } else {
        this.account = this.msalB2cInstance.getAllAccounts()[0]
      }
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse)
      }
    },
    async getAccount() {
      const accounts = this.msalB2cInstance.getAllAccounts();
      if (accounts.length == 0) {
        console.log("no logged in account detected");
        return;
      }
      this.account = accounts[0];
    },
    async login() {
      try {
        let response;
        this.getAccount();
        this.msalB2cInstance.addEventCallback((event) => {
          if (event.eventType === EventType.LOGIN_SUCCESS) {
            this.msalB2cInstance.setActiveAccount(this.account);
          }
        });
        this.msalB2cInstance
          .handleRedirectPromise()
          .then((tokenResponse) => {
            const account = this.msalB2cInstance.getActiveAccount();
            if (!account && tokenResponse) {
              response = tokenResponse;
              this.account = tokenResponse.account;
            } else {
              this.account = this.msalB2cInstance.getAllAccounts()[0];
            }
            if (this.account && tokenResponse) {
              this.updateUserStore(tokenResponse);
            }
          })
          .catch((error) => {
            console.log("login with redirect failed: ", error);
            this.currentB2CUser.isLoggedIn = false;
            localStorage.clear();
            sessionStorage.clear();
            if (error || typeof error === 'string' && error.includes('The provided token does not contain a valid issuer')) {
              this.currentB2CUser.isValidDomain = false
              router.push("/error");
            } else {
              router.push("/");
            }
          });

        if (this.account && response) {
          console.log(
            "[Auth Store] successfully obtained valid account and tokenResponse"
          );
          await this.updateUserStore(response);
        } else if (this.account) {
          console.log("[Auth Store] User has logged in, but no tokens.");
          try {
            this.msalB2cInstance
              .acquireTokenSilent({
                scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
              })
              .then((tokenResponse) => {
                response = tokenResponse;
              })
              .catch((e) => {
                console.log("login error in acquire token silent: ", e);
              });
            await this.updateUserStore(response);
          } catch (err) {
            await this.msalB2cInstance.acquireTokenRedirect(requestScope);
          }
        } else {
          console.log(
            "[Auth Store]  No account or tokenResponse present. User must now login."
          );
          const account = this.msalB2cInstance.getActiveAccount();
          if (!account) {
            this.msalB2cInstance
              .loginRedirect({
                scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
              })
              .then((tokenResponse) => {
                console.log("Login redirect response" + tokenResponse);
                response = tokenResponse;
              })
              .catch((e) => {
                console.log("login error loginRedirect: ", e);
              });
          }
        }
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
      }
    },
    logout() {
      this.currentB2CUser.isLoggedIn = false;
      localStorage.clear();
      sessionStorage.clear();
      this.msalB2cInstance
        .logoutRedirect({ postLogoutRedirectUri: "/" })
        .then(() => {
          console.log("logout successful");
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async updateUserStore(tokenResponse: any) {
      this.currentB2CUser.isValidDomain = true
      this.currentB2CUser.isLoggedIn = true;
      console.log("updating user Store with " + tokenResponse);
      this.accessToken = tokenResponse.accessToken;
      localStorage.setItem("token", this.accessToken);
      this.accessTokenUpdatedOn = new Date()
      this.validateToken()
      const user = await UserService.getUserClaimInfo();
      this.decodedToken = jwt_decode(this.accessToken)
      const identityProviderSelected = this.getIdentityUsingToken(this.decodedToken)
      if (user !== null) {
        this.currentB2CUser = { ...this.currentB2CUser, ...user } as any;
        console.log("currentB2CUser:" + JSON.stringify(this.currentB2CUser));
        localStorage.setItem("userType", this.currentB2CUser.userType);
        store.set('currentb2cUser', this.currentB2CUser);
        if (user.identityProviderName === "Federated") {
          if (user.identityTypeName === identityProviderSelected) {
            this.isValidIdentityProvider = true
          } else if (user.identityProviderName === identityProviderSelected) {
            this.isValidIdentityProvider = true
          }
          else {
            router.push("/error");
          }
        } else if (user.identityProviderName === identityProviderSelected) {
          this.isValidIdentityProvider = true
        }
        else {
          router.push("/error");
        }
      } else {
        router.push("/error");
      }
    },
    getIdentityUsingToken(decodedToken: any) {
      let identityProvider = ""
      if (decodedToken.hasOwnProperty('idp')) {
        if (decodedToken.idp.includes('google')) {
          identityProvider = "Google"
        }
        if (decodedToken.idp.includes('amazon')) {
          identityProvider = "Amazon"
        }
        if (decodedToken.idp.includes('apple')) {
          identityProvider = "Apple"
        }
        if (decodedToken.idp.includes('microsoftonline.com')) {
          identityProvider = "Microsoft"
        }
      } else {
        identityProvider = "Photon"
      }
      return identityProvider
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
  },
});
