import { defineStore } from "pinia";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { useUserSessionStore } from "./usersession";
import UserService from "@/services/userService";
import store from "store";
import router from "@/router";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const authConfig = {
  auth: {
    clientId: import.meta.env.VITE_AAD_CLIEND_ID,
    authority: import.meta.env.VITE_AAD_AUTHORITY,
    responseMode: "query",
    redirectUri: import.meta.env.VITE_AAD_REDIRECT_URL,
    postLogoutRedirectUri: import.meta.env.VITE_USER_APP_BASE_URL,
  },
};

const requestScope = {
  scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
};

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      currentUser: store.get("currentUser")
        ? store.get("currentUser")
        : useUserSessionStore().userSession,
      account: null as AccountInfo | null,
      msalInstance: new PublicClientApplication(authConfig),
      accessToken: "",
      accessTokenUpdatedOn: new Date(),
      accessTokenValidation: null,
      redirectAfterLogin: "/dashboard",
      isValidIdentityProvider: true,
    };
  },
  actions: {
    async aquireToken() {
      // 1. try to obtain token use account detaials
      await this.getAccount();
      // 2. try to obtain token if the user had already logged in
      const tokenResponse = await this.msalInstance.handleRedirectPromise();
      if (tokenResponse) {
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalInstance.getAllAccounts()[0];
      }
      this.updateUserStore(tokenResponse);
      logger.log("aquireToken - completed");
    },
    async acquireTokenSilent() {
      // 1. try to obtain token use account detaials
      await this.getAccount();
      const accessTokenRequest = {
        scopes: [import.meta.env.VITE_AAD_TOKEN_SCOPE],
        account: this.msalInstance.getAllAccounts()[0],
      };
      console.info("acquireTokenSilent");
      logger.log("acquireTokenSilent");
      const tokenResponse =
        await this.msalInstance.acquireTokenSilent(accessTokenRequest);
      if (tokenResponse) {
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalInstance.getAllAccounts()[0];
      }
      this.updateUserStore(tokenResponse);
      logger.log("acquireTokenSilent - completed");
    },
    async getAccount() {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length == 0) {
        logger.log("getAccount - no logged in account detected");
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
        if (tokenResponse) {
          this.account = tokenResponse.account;
        } else {
          this.account = this.msalInstance.getAllAccounts()[0];
        }
        localStorage.setItem("AuthType", "AzureAd");
        if (this.account && tokenResponse) {
          console.log(
            "[Auth Store] successfully obtained valid account and tokenResponse",
          );
          logger.log(
            "Login - Successfully obtained valid account and tokenResponse",
          );
        } else if (this.account) {
          console.log("[Auth Store] User has logged in, but no tokens.");
          logger.log("Login - User has logged in, but no tokens.");
          try {
            tokenResponse =
              await this.msalInstance.acquireTokenSilent(accessTokenRequest);
          } catch (err) {
            await this.msalInstance.acquireTokenRedirect(requestScope);
          }
        } else {
          console.log(
            "[Auth Store]  No account or tokenResponse present. User must now login.",
          );
          logger.log(
            "Login - No account or tokenResponse present. User must now login.",
          );
          await this.msalInstance.loginRedirect(requestScope);
        }
        await this.updateUserStore(tokenResponse);
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
        logger.error(
          "Login - [Auth Store] Failed to handleRedirectPromise()",
          error,
        );
      }
    },
    async logout() {
      this.currentUser.isLoggedIn = false;
      localStorage.clear();
      sessionStorage.clear();
      await this.msalInstance
        .logoutRedirect({
          postLogoutRedirectUri: authConfig.auth.postLogoutRedirectUri,
        })
        .then(() => {
          console.log("logout successful");
          logger.log("Logout - logout successful");
        })
        .catch((error) => {
          console.error("[Logout Error]", error);
          logger.error("Logout - [Logout Error]", error);
        });
    },
    async updateUserStore(tokenResponse) {
      console.log("updating user Store with " + tokenResponse);
      logger.log("updateUserStore - updating user Store with ", tokenResponse);
      this.accessToken = tokenResponse.accessToken;
      localStorage.setItem("token", this.accessToken);
      this.accessTokenUpdatedOn = new Date();
      const user = await UserService.getUserClaimInfo();
      if (user !== null && user.status === undefined) {
        localStorage.setItem("Claims", user.claims);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.currentUser = { ...this.currentUser, ...user } as any;
        localStorage.setItem("userType", this.currentUser.userType);
        this.currentUser.isLoggedIn = true;
        store.set("currentUser", this.currentUser);
      } else {
        router.push("/error");
      }
    },
    resetLogin() {
      this.currentUser.isLoggedIn = false;
    },
  },
});
