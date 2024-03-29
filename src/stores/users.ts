/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { chunk } from "lodash";
import router from "@/router";
import type { UserDto } from "../models/UserDto";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import UserService from "@/services/userService";
import type { SearchRequestDto } from "../models/SearchRequestDto";
import type { UserSearchResponseDto } from "../models/UserSearchResponseDto";
import type { PrinterDto } from "../models/PrinterDto";
import { Logger } from "@/logger/logger";
import type { PlatingLocationDto } from "../models/PlatingLocationDto";

const logger = new Logger("stores-auth");

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

export async function fetchPlatingLocations() {
  try {
    const locationResult = await UserService.getPlatingLocations();
    return locationResult;
  } catch (error) {
    logger.error("Error fetching plating locations:", error);
    return [];
  }
}

export function IterateUser(userList: [], count: number) {
  const usersSearchResponseArr = [] as UserSearchResponseDto[];
  for (let i = 0; i < count; i++) {
    usersSearchResponseArr.push(userList[i]);
  }
  return usersSearchResponseArr;
}

export function IterateUserPerPage(
  userList: [],
  count: number,
  pagenumber: number,
) {
  const usersSearchResponseArr = [] as UserSearchResponseDto[];
  const startIndex = (pagenumber - 1) * 30;
  const endIndex = Math.min(startIndex + 30, count);

  const emptyUserList: UserSearchResponseDto[] = [];

  for (let i = 0; i < count; i++) {
    if (i >= startIndex && i < endIndex) {
      for (let j = 0; j < userList.length; j++) {
        if (userList[j] !== undefined) {
          usersSearchResponseArr.push(userList[j]);
        }
        i = endIndex;
      }
    } else {
      usersSearchResponseArr.push(emptyUserList[i]);
    }
  }

  return usersSearchResponseArr;
}

export async function searchPrinter(
  printerId: number,
  userIdValue: number,
  userType = "",
  searchPrinterKey = "",
  loginUserType = "",
) {
  try {
    let externalprinterCountResponse: any;
    // Create a SearchRequestDto object with the printerName and other parameters
    const searchRequest: SearchRequestDto = {
      searchText: searchPrinterKey,
      pageNumber: 1,
      pageCount: 30,
      orderBy: "PrinterId",
      orderByAsc: true,
      isActive: true,
      printerId: printerId,
      userId: 0,
      userTypeKey: userType,
    };

    const printerResponse = await UserService.searchPrinter(searchRequest);

    // if the login user is external
    if (loginUserType === "EXT") {
      externalprinterCountResponse = await UserService.GetExternalUserCount(
        String(userIdValue),
        String(printerId),
      );
    }

    if (printerResponse && printerResponse.data) {
      // Map the API response data to the desired format
      const printers = printerResponse.data.map((printer) => ({
        id: printer.printerId,
        name: printer.printerName,
        //onboardedAt: faker.date.recent(),
        summary: {
          admins: printer.totalUserCount,
          users:
            loginUserType === "EXT"
              ? externalprinterCountResponse !== undefined
                ? externalprinterCountResponse.externalUserCount
                : 0
              : printer.externalUserCount,
          //users:printer.externalUserCount,
          internalUsers: printer.internalUserCount,
          identityProvider: printer.identityProviderName,
        },
        identityProviderId: printer.identityProviderId,
        identityProviderName: printer.identityProviderName,
        identityTypeId: printer.identityTypeId,
        identityTypeName: printer.identityTypeName,
      }));

      // Return the mapped printers array
      return printers;
    } else {
      console.error("[Error searching printers response]:", printerResponse);
      logger.error("[Error searching printers response]:", printerResponse);
      return [];
    }
  } catch (error) {
    console.error("[Error searching printers]:", error);
    logger.error("[Error searching printers]:", error);
    return [];
  }
}

export const useUsersStore = defineStore("users", {
  state: () => ({
    all: [] as any[],
    printers: {
      page: 0,
      perPage: 20,
      data: [] as any[],
    } as any,
    selected: null as any,
    loading: {
      printers: false,
      printer: false,
    },
    options: {
      platingLocations: [] as any[],
    },
    user: null as any,
    userSearchExtResp: null as any,
    userSearchIntResp: null as any,
    userTypeValue: null as any,
    userRoleValue: null as any,
    identityProviderId: null as any,
    identityProviderName: null as any,
    identityTypeId: null as any,
    identityTypeName: null as any,
  }),
  actions: {
    async getPrinters(
      page: number,
      perPage = 500,
      searchUserKey = "",
      searchPrinterKey = "",
      requestPrinterId: any,
    ) {
      const total = 500;
      let printerId = "";
      let userId: any;

      if (authStore.currentUser.email != "") {
        if (
          authStore.currentUser?.userType !== undefined &&
          authStore.currentUser?.userType !== null
        ) {
          this.userTypeValue = authStore.currentUser.userType;
          userId = authStore.currentUser.userId;
        }
      }

      if (authb2cStore.currentB2CUser.email != "") {
        if (
          authb2cStore.currentB2CUser?.userType !== undefined &&
          authb2cStore.currentB2CUser?.userType !== null
        ) {
          this.userTypeValue = authb2cStore.currentB2CUser.userType;
          userId = authb2cStore.currentB2CUser.userId;
        }
        if (
          authb2cStore.currentB2CUser?.printerId !== undefined &&
          authb2cStore.currentB2CUser?.printerId !== null
        ) {
          printerId = authb2cStore.currentB2CUser.printerId.toString();
        }
      }

      if (this.userTypeValue === "INT") {
        if (!this.all.length || page === 0) {
          const all = await searchPrinter(
            0,
            0,
            "",
            searchPrinterKey,
            this.userTypeValue,
          );
          this.all = chunk(all, 500);
        }
      } else if (this.userTypeValue === "EXT") {
        if (!this.all.length || page === 0) {
          const all = await searchPrinter(
            Number(printerId),
            userId,
            "",
            searchPrinterKey,
            this.userTypeValue,
          );
          this.all = chunk(all, 500);
        }
      }

      this.printers = {
        page,
        perPage,
        total,
        data: this.all && this.all[page] ? this.all[page] : [],
      };

      this.selected = this.printers.data[0];
      if (this.userTypeValue !== "EXT") {
        if (requestPrinterId === undefined) {
          this.getPrinterById(this.selected?.id, searchUserKey);
        } else {
          this.getPrinterById(requestPrinterId, searchUserKey);
        }
      } else {
        this.getPrinterById(this.selected?.id, searchUserKey);
      }
    },
    async getPrinterById(id: string, searchUserValue = "") {
      const printer = this.printers.data.find((p: any) => p.id === id);
      if (printer != undefined) {
        let prtId = 0;
        let userId = 0;
        let userType = "";
        // let searchKey = "";
        // let printerName = "";

        //validating the user type.
        if (authStore.currentUser.email != "") {
          if (
            authStore.currentUser?.userType !== undefined &&
            authStore.currentUser?.userType !== null
          ) {
            userType = authStore.currentUser.userType;
          }
        }

        if (authb2cStore.currentB2CUser.email != "") {
          if (
            authb2cStore.currentB2CUser?.userType !== undefined &&
            authb2cStore.currentB2CUser?.userType !== null
          ) {
            userType = authb2cStore.currentB2CUser.userType;
          }
        }

        if (userType === "INT" && id === "") {
          const firstPrinter = this.printers.data[0];
          id = firstPrinter;
        }

        if (userType == "EXT") {
          if (
            authb2cStore.currentB2CUser?.printerId !== undefined &&
            authb2cStore.currentB2CUser?.printerId !== null
          ) {
            prtId = Number(authb2cStore.currentB2CUser.printerId);
          }

          if (
            authb2cStore.currentB2CUser?.userId !== undefined &&
            authb2cStore.currentB2CUser?.userId !== null
          ) {
            userId = Number(authb2cStore.currentB2CUser.userId);
          }
        }

        if (userType == "INT") {
          if (id != undefined || id != "") {
            prtId = Number(id);
          }
        }

        if (printer != undefined) {
          this.identityProviderId = printer.identityProviderId;
          this.identityProviderName = printer.identityProviderName;
          this.identityTypeId = printer.identityTypeId;
          this.identityTypeName = printer.identityTypeName;
        }

        if (userType === "INT") {
          const locationResult = await fetchPlatingLocations();

          if (locationResult && locationResult.length > 0) {
            this.options.platingLocations = locationResult.map((location) => ({
              label: location.platingLocationName,
              value: location.platingLocationName,
            }));
          } else {
            this.options.platingLocations = [];
          }
        }

        if (userType === "INT") {
          userId = 0;
        }

        if (userType == "EXT") {
          this.userSearchExtResp = await this.searchUsers(
            prtId,
            userId,
            "EXT",
            searchUserValue,
          );
        } else if (userType == "INT") {
          this.userSearchExtResp = await this.searchUsers(
            prtId,
            userId,
            "EXT",
            searchUserValue,
          );
        }
        this.userSearchIntResp = await this.searchUsers(
          prtId,
          userId,
          "INT",
          searchUserValue,
        );
        const printerDetails = {
          ...printer,
          users: [
            //printer.name
            ...IterateUser(
              this.userSearchExtResp.data,
              this.userSearchExtResp.totalRecords,
            ),
          ],
          internalUsers: [
            ...IterateUser(
              this.userSearchIntResp.data,
              this.userSearchIntResp.totalRecords,
            ),
          ],
          identityProvider: {
            type: this.identityProviderName,
            tenantId: null,
            admin: null,
            email: null,
          },
        };
        this.selectPrinter(printerDetails);
      }
    },
    selectPrinter(printer: any) {
      this.selected = { ...printer };
    },
    createUser() {
      this.user = null;
      if (this.selected) {
        this.user = this.user || {
          firstName: null,
          lastName: null,
          email: null,
          isAdmin: false,
          isPrimaryPM: false,
        };
      }
      router.push("/users/new");
    },
    async getUser(id: string, printerId: any) {
      this.user = null;
      const userEditResp = await UserService.getUserDetails(id, printerId);
      if (userEditResp != null) {
        let isPrimaryPMValue: any;

        if (
          userEditResp.userPrinter &&
          Array.isArray(userEditResp.userPrinter)
        ) {
          const userPrinter = userEditResp.userPrinter.find(
            (prt) => prt.printerId === this.selected.id,
          );

          if (userPrinter) {
            isPrimaryPMValue = userPrinter.isPrimaryPM;
          }
        }
        const selectedplatingLocations = userEditResp?.userPrinter
          ?.map((userPrtLoc: any) => userPrtLoc.platingLocationName)
          .filter((location: string | null) => location !== null);
        this.options.platingLocations = this.options.platingLocations.map(
          (plLocation: any) => ({
            ...plLocation,
            selected: selectedplatingLocations?.includes(plLocation.value),
          }),
        );

        this.user = {
          id: userEditResp.id,
          firstName: userEditResp.firstName,
          lastName: userEditResp.lastName,
          email: userEditResp.email,
          isAdmin: userEditResp.roles?.[0]?.isAdmin || false,
          isPrimaryPM: isPrimaryPMValue || false,
          userType: userEditResp.userType,
          platingLocations:
            selectedplatingLocations !== null
              ? selectedplatingLocations
              : undefined,
        };

        if (this.user && printerId != 0) {
          this.editUser(this.user);
        }
      } else {
        console.error("User not found");
        logger.error("User not found");
      }
    },
    editUser(user: any) {
      if (this.selected && user) {
        this.user = { ...user };
      }
      router.push(`/users/${this.user.id}`);
    },
    async saveUser(userreq: any) {
      this.user = null;
      let printerIdValue: number | null = null;
      let userType = "";

      if (authStore.currentUser.email != "") {
        if (
          authStore.currentUser?.userType !== undefined &&
          authStore.currentUser?.userType !== null &&
          authStore.currentUser?.userType != ""
        ) {
          userType = authStore.currentUser.userType;
        }
      }

      if (authb2cStore.currentB2CUser.email != "") {
        if (
          authb2cStore.currentB2CUser?.userType !== undefined &&
          authb2cStore.currentB2CUser?.userType !== null &&
          authb2cStore.currentB2CUser?.userType != ""
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          userType = authb2cStore.currentB2CUser.userType;
        }
      }

      if (
        authb2cStore.currentB2CUser?.printerId !== undefined &&
        authb2cStore.currentB2CUser?.printerId !== null &&
        typeof authb2cStore.currentB2CUser.printerId === "number" &&
        authb2cStore.currentB2CUser.printerId > 0
      ) {
        printerIdValue = Number(authb2cStore.currentB2CUser.printerId);
      } else {
        printerIdValue = this.selected.id;
      }

      const platingLoc: PlatingLocationDto[] = [];
      userreq.value.platingLocations?.forEach((pltlocation: string) => {
        platingLoc.push({
          platingLocationName: pltlocation,
        });
      });

      const userDto: UserDto = {
        id: userreq.value.id,
        firstName: userreq.value.firstName,
        lastName: userreq.value.lastName,
        displayName: `${userreq.value.firstName} ${userreq.value.lastName}`,
        email: userreq.value.email,
        printerId: printerIdValue,
        roles: null,
        isAdmin: userreq.value.isAdmin,
        isPrimaryPM: userreq.value.isPrimaryPM,
        platingLocation: platingLoc,
      };

      return await UserService.saveUser(userDto);
    },
    async savePrinter(printerreq: any) {
      const platingLocReq: PlatingLocationDto[] = [];

      if (printerreq.value?.platingLocations?.value) {
        printerreq.value?.platingLocations?.value.forEach(
          (pltlocation: string) => {
            platingLocReq.push({
              platingLocationName: pltlocation,
            });
          },
        );
      }

      const printerDto: PrinterDto = {
        printerName: printerreq.value.name,
        userData: [
          {
            firstName: printerreq.value.adminFirstName,
            lastName: printerreq.value.adminLastName,
            displayName:
              printerreq.value.adminFirstName + printerreq.value.adminLastName,
            email: printerreq.value.adminEmail,
            isAdmin: true,
          },
          {
            firstName: printerreq.value.primaryPMFirstName,
            lastName: printerreq.value.primaryPMLastName,
            displayName:
              printerreq.value.primaryPMFirstName +
              printerreq.value.primaryPMLastName,
            email: printerreq.value.primaryPMEmail,
            isAdmin: false,
            isPrimaryPM: true,
            platingLocation: platingLocReq,
          },
        ],
        printerIdentityProv: [
          {
            identityProviderId: printerreq.value.provider,
            identityTypeId: printerreq.value.federatedProvider,
          },
        ],
      };
      return UserService.SavePrinter(printerDto);
    },
    async deleteUser(user: any) {
      let printerIdVal = "";

      try {
        printerIdVal = this.selected.id;
        await UserService.DeleteUser(user, printerIdVal);
      } catch (error) {
        console.error("[Error deleting user]:", error);
        logger.error("[Error deleting user]:", error);
      }
    },
    async resendInvitation(user: any) {
      try {
        await UserService.ResendInvitation(user);
      } catch (error) {
        console.error("[Error resending invitation]:", error);
        logger.error("[Error resending invitation]:", error);
      }
    },
    async searchUsers(
      printerId: number,
      userIdValue: number,
      userType: string,
      searchValue: string,
      pageNum: number = 1,
      pageCount: number = 30,
    ) {
      try {
        const searchRequest: SearchRequestDto = {
          searchText: searchValue,
          pageNumber: pageNum,
          pageCount: pageCount,
          orderBy: "ModifiedOn",
          orderByAsc: true,
          isActive: true,
          printerId: printerId,
          userId: 0,
          userTypeKey: userType,
        };

        const usersResponse = await UserService.searchUser(searchRequest);

        if (usersResponse) {
          return usersResponse;
        } else {
          logger.error("[UserResponse is empty]:", usersResponse);
        }
      } catch (error) {
        logger.error("[Error searching users]:", error);
      }
    },
    async assignPaginatedData(
      newPage: any,
      printerId: number,
      userType: string,
    ) {
      const userIdValue = 0;
      const searchValue = "";
      const pageCount = 30;
      let usersResponse;

      if (userType === "users") {
        usersResponse = await this.searchUsers(
          printerId,
          userIdValue,
          "EXT",
          searchValue,
          newPage + 1,
          pageCount,
        );

        if (usersResponse) {
          this.selected = {
            ...this.selected,
            users: [
              ...IterateUserPerPage(
                usersResponse.data,
                usersResponse.totalRecords,
                newPage + 1,
              ),
            ],
          };
        }
      } else {
        usersResponse = await this.searchUsers(
          printerId,
          userIdValue,
          "INT",
          searchValue,
          newPage + 1,
          pageCount,
        );

        if (usersResponse) {
          this.selected = {
            ...this.selected,
            internalUsers: [
              ...IterateUserPerPage(
                usersResponse.data,
                usersResponse.totalRecords,
                newPage + 1,
              ),
            ],
          };
        }
      }
    },
  },
});
