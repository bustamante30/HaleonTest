import { defineStore } from "pinia";
import {
  PublicClientApplication,
  type AccountInfo,
  LogLevel,
} from "@azure/msal-browser";
import { userB2CSessionStore } from "@/stores/userb2csession";

const authB2CConfig = {
  auth: {
    clientId: "66a0287e-e110-40dd-9091-78002341c362", // import.meta.env.VITE_AAD_CLIEND_ID,
    authority:
      "https://sgscophoton.b2clogin.com/sgscophoton.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN",
    knownAuthorities: ["sgscophoton.b2clogin.com"],
    responseMode: "query",
    redirectUri: "http://localhost:3000/b2clogin",
    postLogoutRedirectUri: "http://localhost:3000",
    navigateToLoginRequestUrl: true,
  },

};
const requestScope = {
  scopes: [
    "openid",
    "profile",
    "email",
    "https://sgscophoton.onmicrosoft.com/66a0287e-e110-40dd-9091-78002341c362/.default",
  ],
};
export const useB2CAuthStore = defineStore("b2cauth", {
  state: () => ({
    msalB2cInstance: new PublicClientApplication(authB2CConfig),
    accessToken: "",
    currentB2CUser: userB2CSessionStore(),
    account: null as AccountInfo | null,
  }),
  actions: {
    async aquireToken() {
      // 1. try to obtain token use account detaials
      await this.getAccount();
      // 2. try to obtain token if the user had already logged in
      let tokenResponse = await this.msalB2cInstance.handleRedirectPromise();
      if (tokenResponse) {
        console.log("Token" + tokenResponse);
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalB2cInstance.getAllAccounts()[0];
      }
      // if the the user is logged in
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse);
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
        // let tokenResponse = {};
        let tokenResponse = await this.msalB2cInstance.handleRedirectPromise();
        // const accessTokenRequest = {
        //   scopes: [
        //     "openid",
        //     "profile",
        //     "email",
        //     "https://graph.microsoft.com/.default",
        //     "https://sgscophoton.onmicrosoft.com/66a0287e-e110-40dd-9091-78002341c362/image.read"
        //   ],
        //   account: this.msalB2cInstance.getAllAccounts()[0],
        // };

        if (tokenResponse) {
          this.account = tokenResponse.account;
        } else {
          this.account = this.msalB2cInstance.getAllAccounts()[0];
        }

        if (this.account && tokenResponse) {
          console.log(
            "[Auth Store] successgully obtained valid account and tokenResponse"
          );
          await this.updateUserStore(tokenResponse);
        } else if (this.account) {
          console.log("[Auth Store] User has logged in, but no tokens.");
          try {
            tokenResponse = await this.msalB2cInstance.acquireTokenSilent({
              scopes: [
                "https://sgscophoton.onmicrosoft.com/66a0287e-e110-40dd-9091-78002341c362/image.read",
              ],
            });
            await this.updateUserStore(tokenResponse);
          } catch (err) {
            await this.msalB2cInstance.acquireTokenRedirect(requestScope);
          }
        } else {
          console.log(
            "[Auth Store]  No account or tokenResponse present. User must now login."
          );
          await this.msalB2cInstance.loginRedirect()
          // await this.msalB2cInstance.loginRedirect({
          //   scopes: [
          //     "https://sgscophoton.onmicrosoft.com/66a0287e-e110-40dd-9091-78002341c362/image.read",
          //   ],
          // });
        }
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
      }
    },

    async logout() {
      await this.msalB2cInstance
        .logoutRedirect({ postLogoutRedirectUri: "/" })
        .then(() => {
          console.log("logout successful");
          this.currentB2CUser.isLoggedIn = false;
          localStorage.clear();
          sessionStorage.clear();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async updateUserStore(tokenResponse: any) {
      this.currentB2CUser.isLoggedIn = true;
      console.log("updating user Store with " + tokenResponse);
    },
  },
});
