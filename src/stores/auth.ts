import { defineStore } from "pinia";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { userSessionStore } from "@/stores/usersession";
import UserService from "@/services/userService";

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
  scopes:  [import.meta.env.VITE_AAD_TOKEN_SCOPE],
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: userSessionStore(),
    account: null as AccountInfo | null,
    msalInstance: new PublicClientApplication(authConfig),
    accessToken: "",
  }),
  actions: {
    async aquireToken() {
      // 1. try to obtain token use account detaials
      await this.getAccount();
      // 2. try to obtain token if the user had already logged in
      let tokenResponse = await this.msalInstance.handleRedirectPromise();
      if (tokenResponse) {
        console.log("Token" + tokenResponse);
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalInstance.getAllAccounts()[0];
      }
      // if the the user is logged in
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse);
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
      this.accessToken = tokenResponse.accessToken;
      console.log('accessToken'+ this.accessToken);
      localStorage.setItem("token", this.accessToken);

      const user = await UserService.getV1User();
  
      this.currentUser.firstName = user.firstName as string;
      this.currentUser.lastName = user.lastName as string;
      this.currentUser.email = user.email as string;
      this.currentUser.displayName = user.displayName as string;
      this.currentUser.userType = user.userType as string;
      localStorage.setItem("userType",this.currentUser.userType);
    },
  },
});
