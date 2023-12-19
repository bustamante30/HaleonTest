import { defineStore } from "pinia";
import {
  EventType,
  PublicClientApplication,
  type AccountInfo,
} from "@azure/msal-browser";
import { userB2CSessionStore } from "@/stores/userb2csession";
import UserService from "@/services/userService";
import jwt_decode from "jwt-decode";
import router from "@/router";
import store from "store";
import type { SearchRequestDto } from "@/models/SearchRequestDto";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

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

const printerIdSearch = async (currentB2CUser): Promise<number[]> => {
  if (
    currentB2CUser.userType === "EXT" &&
    currentB2CUser.roleKey.toLowerCase().includes("admin")
  ) {
    // Make User Search call to get List users
    const saerchUsers: SearchRequestDto = {
      searchText: "",
      pageNumber: 1,
      pageCount: 1000,
      orderBy: "modifiedOn",
      orderByAsc: true,
      isActive: true,
      printerId: parseInt(currentB2CUser.printerId.toString(), 10),
      userId: 0,
      userTypeKey: "EXT",
      isDashboardPage: true,
    };

    const users = await UserService.searchUser(saerchUsers);
    return (users && users.data.map((x) => x.id)) || [];
  }

  return [];
};
export const useB2CAuthStore = defineStore("b2cauth", {
  state: () => {
    const userb2cSessionStore = userB2CSessionStore();
    return {
      msalB2cInstance: new PublicClientApplication(authB2CConfig),
      accessToken: "",
      currentB2CUser: userb2cSessionStore.userB2CSession,
      account: null as AccountInfo | null,
      accessTokenUpdatedOn: new Date(),
      accessTokenValidation: null,
      redirectAfterLogin: "/dashboard",
      decodedToken: {},
      isValidIdentityProvider: false,
      userEmail: "",
    };
  },
  actions: {
    async aquireToken() {
      await this.getAccount();
      const tokenResponse = await this.msalB2cInstance.handleRedirectPromise();
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
      await this.getAccount();
      const accessTokenRequest = {
        scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
        account: this.msalB2cInstance.getAllAccounts()[0],
      };
      console.info("acquireTokenSilent");
      logger.log("acquireTokenSilent");
      const tokenResponse =
        await this.msalB2cInstance.acquireTokenSilent(accessTokenRequest);
      if (tokenResponse) {
        this.account = tokenResponse.account;
      } else {
        this.account = this.msalB2cInstance.getAllAccounts()[0];
      }
      if (this.account && tokenResponse) {
        this.updateUserStore(tokenResponse);
      }
    },
    async getAccount() {
      const accounts = this.msalB2cInstance.getAllAccounts();
      if (accounts.length == 0) {
        console.error("no logged in account detected");
        logger.error("no logged in account detected");
        return;
      }
      this.account = accounts[0];
    },
    async ssoLogin(email: string) {
      const account = this.msalB2cInstance.getAccountByUsername(email);
      if (account) {
        this.account = account;
      }
      const silentRequest = {
        scopes: [
          "openid",
          "profile",
          "email",
          import.meta.env.VITE_B2C_TOKEN_SCOPE,
        ],
        loginHint: email,
      };
      try {
        const loginResponse =
          await this.msalB2cInstance.ssoSilent(silentRequest);
        localStorage.setItem("AuthType", "AzureAdB2C");
        await this.updateUserStore(loginResponse);
        console.log(
          "SSO Login is success and the response is :" + loginResponse,
        );
      } catch (err) {
        if (err) {
          this.msalB2cInstance
            .loginRedirect({
              scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
              loginHint: this.userEmail,
            })
            .then((tokenResponse) => {
              console.log("SSO Login redirect response" + tokenResponse);
              this.updateUserStore(tokenResponse);
            })
            .catch(async (e) => {
              console.log("SSO login error loginRedirect: ", e);
            });
        } else {
          // handle error
        }
      }
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
              localStorage.setItem("AuthType", "AzureAdB2C");
              this.updateUserStore(tokenResponse);
            }
          })
          .catch((error) => {
            console.error("login with redirect failed: ", error);
            logger.error("login with redirect failed: ", error);
            this.currentB2CUser.isLoggedIn = false;
            localStorage.clear();
            sessionStorage.clear();
            if (
              error ||
              (typeof error === "string" &&
                error.includes(
                  "The provided token does not contain a valid issuer",
                ))
            ) {
              this.currentB2CUser.isValidDomain = false;
              router.push("/error");
            } else {
              router.push("/");
            }
          });

        if (this.account && response) {
          console.log(
            "[Auth Store] successfully obtained valid account and tokenResponse",
          );
          logger.log(
            "Login - Successfully obtained valid account and tokenResponse",
          );
          await this.updateUserStore(response);
        } else if (this.account) {
          console.log("[Auth Store] User has logged in, but no tokens.");
          logger.log("Login - User has logged in, but no tokens.");
          try {
            this.msalB2cInstance
              .acquireTokenSilent({
                scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
              })
              .then((tokenResponse) => {
                response = tokenResponse;
              })
              .catch((e) => {
                console.error("login error in acquire token silent: ", e);
                logger.error(
                  "Login - login error in acquire token silent: ",
                  e,
                );
              });
            await this.updateUserStore(response);
          } catch (err) {
            await this.msalB2cInstance.acquireTokenRedirect(requestScope);
            await this.updateUserStore(response);
          }
        } else {
          console.error(
            "[Auth Store]  No account or tokenResponse present. User must now login.",
          );
          logger.error(
            "Login - No account or tokenResponse present. User must now login.",
          );
          const account = this.msalB2cInstance.getActiveAccount();
          if (!account) {
            this.msalB2cInstance
              .loginRedirect({
                scopes: [import.meta.env.VITE_B2C_TOKEN_SCOPE],
                loginHint: this.userEmail,
              })
              .then((tokenResponse) => {
                console.log("Login redirect response" + tokenResponse);
                logger.log("Login redirect response" + tokenResponse);
                response = tokenResponse;
              })
              .catch(async (e) => {
                console.error("login error loginRedirect: ", e);
                logger.error("Login - login error loginRedirect: ", e);
              });
          }
        }
      } catch (error) {
        console.error("[Auth Store]  Failed to handleRedirectPromise()", error);
        logger.error("Login - Failed to handleRedirectPromise()", error);
      }
    },
    logout() {
      this.currentB2CUser.isLoggedIn = false;
      localStorage.clear();
      sessionStorage.clear();
      this.msalB2cInstance
        .logoutRedirect({ postLogoutRedirectUri: "/b2clogin" })
        .then(() => {
          console.log("logout successful");
          logger.log("logout successful");
        })
        .catch((error) => {
          console.error("[Logout Error]", error);
          logger.error("Logout - [Logout Error]", error);
        });
    },
    async updateUserStore(tokenResponse) {
      this.currentB2CUser.isValidDomain = true;
      console.log("updating user Store with " + tokenResponse);
      logger.log("updating user Store with " + tokenResponse);
      this.accessToken = tokenResponse.accessToken;
      localStorage.setItem("token", this.accessToken);
      this.accessTokenUpdatedOn = new Date();
      const user = await UserService.getUserClaimInfo();
      this.decodedToken = jwt_decode(this.accessToken);
      const identityProviderSelected = this.getIdentityUsingToken(
        this.decodedToken,
      );
      if (user !== null) {
        localStorage.setItem("Claims", user.claims);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.currentB2CUser = { ...this.currentB2CUser, ...user } as any;
        localStorage.setItem("userType", this.currentB2CUser.userType);
        this.currentB2CUser.printerUserIds = await printerIdSearch(
          this.currentB2CUser,
        );
        if (user.identityProviderName === "Federated") {
          if (user.identityTypeName === identityProviderSelected) {
            this.isValidIdentityProvider = true;
            this.currentB2CUser.isLoggedIn = true;
          } else if (user.identityProviderName === identityProviderSelected) {
            this.isValidIdentityProvider = true;
            this.currentB2CUser.isLoggedIn = true;
          } else {
            this.currentB2CUser.isLoggedIn = false;
            router.push("/error");
          }
        } else if (user.identityProviderName === identityProviderSelected) {
          this.currentB2CUser.isLoggedIn = true;
          this.isValidIdentityProvider = true;
        } else {
          this.currentB2CUser.isLoggedIn = false;
          router.push("/error");
        }

        store.set("currentb2cUser", this.currentB2CUser);
      } else {
        router.push("/error");
      }
    },
    getIdentityUsingToken(decodedToken) {
      let identityProvider = "";
      // eslint-disable-next-line no-prototype-builtins
      if (decodedToken.hasOwnProperty("idp")) {
        if (decodedToken.idp.includes("google")) {
          identityProvider = "Google";
        }
        if (decodedToken.idp.includes("amazon")) {
          identityProvider = "Amazon";
        }
        if (decodedToken.idp.includes("apple")) {
          identityProvider = "Apple";
        }
        if (decodedToken.idp.includes("microsoftonline.com")) {
          identityProvider = "Microsoft";
        }
      } else {
        identityProvider = "Photon";
      }
      return identityProvider;
    },
    resetLogin() {
      this.currentB2CUser.isLoggedIn = false;
    },
    setUseremail(id) {
      this.userEmail = id;
    },
  },
});
