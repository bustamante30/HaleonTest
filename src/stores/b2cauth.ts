import { defineStore } from "pinia";
import {
  EventType,
  PublicClientApplication,
  type AccountInfo,
} from "@azure/msal-browser";
import { userB2CSessionStore } from "@/stores/userb2csession";
import UserService from "@/services/userService";
import router from "@/router";

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
  state: () => ({
    msalB2cInstance: new PublicClientApplication(authB2CConfig),
    accessToken: "",
    currentB2CUser: userB2CSessionStore(),
    account: null as AccountInfo | null,
  }),
  actions: {
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
          // set active account after redirect
          if (event.eventType === EventType.LOGIN_SUCCESS) {
            // this.account = event?.payload?.account 
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
            // if the the user is logged in
            if (this.account && tokenResponse) {
              this.updateUserStore(tokenResponse);
            }
          })
          .catch((error) => {
            console.log("login with redirect failed: ", error);
            this.currentB2CUser.isLoggedIn = false;
            localStorage.clear();
            sessionStorage.clear();
            router.push("/");
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
      this.currentB2CUser.isLoggedIn = true;
      console.log("updating user Store with " + tokenResponse);
      this.accessToken = tokenResponse.accessToken;
      localStorage.setItem("token", this.accessToken);
      const user = await UserService.getV1User();
      this.currentB2CUser.firstName = user.firstName as string;
      this.currentB2CUser.lastName = user.lastName as string;
      this.currentB2CUser.email = user.email as string;
      this.currentB2CUser.displayName = user.displayName as string;
    },
  },
});
