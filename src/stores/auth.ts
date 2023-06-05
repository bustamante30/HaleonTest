import { defineStore } from "pinia";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { userSessionStore } from "@/stores/usersession";

const authConfig = {
  auth: {
    clientId: "ac45b74a-2cd1-49f9-b192-e965e5d3ebfa", // import.meta.env.VITE_AAD_CLIEND_ID,
    authority:"https://login.microsoftonline.com/8714a216-0445-4269-b96b-7d84bddb6da1",
    responseMode: "query",
    redirectUri: "http://localhost:3000/login",
    postLogoutRedirectUri:
    "http://localhost:3000",
  },
  // cache: {
  //   storeAuthStateInCookie: true,
  //   cacheLocation: "memoryStorage",
  // },
};

const requestScope = {
  scopes: ["api://add0c5cd-c3a8-44fa-8161-ac6250e7a19a/access_as_user"],
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
        console.log('Token' + tokenResponse)
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
        // await this.msalInstance.loginRedirect();
        return;
      }
      this.account = accounts[0];
    },

    async login() {
      try {
        let tokenResponse = await this.msalInstance.handleRedirectPromise();
        const accessTokenRequest = {
          scopes: ["api://add0c5cd-c3a8-44fa-8161-ac6250e7a19a/access_as_user"],
          account: this.msalInstance.getAllAccounts()[0],
        };

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
          await this.msalInstance.loginRedirect();
        }
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
      }
    },
    async logout() {
      await this.msalInstance
        .logoutRedirect({ postLogoutRedirectUri: "/" })
        .then(() => {
          console.log("logout successful");
          this.currentUser.isLoggedIn = false;
          localStorage.clear()
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async updateUserStore(tokenResponse: any) {
      this.currentUser.isLoggedIn = true;
      console.log("updating user Store with " + tokenResponse);
    },
  },
});
