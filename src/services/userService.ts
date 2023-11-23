import type { UserClaimDto } from "../models/UserClaimDto";
import type { UserDto } from "../models/UserDto";
import type { SearchRequestDto } from "../models/SearchRequestDto";
import type { SearchResponeDto } from "../models/SearchResponeDto";
import type { PrinterDto } from "../models/PrinterDto";
import ApiService from "../services/apiService";
import type { ExternalPrinterCountResponseDto } from "../models/ExternalPrinterCountResponseDto";
import { useNotificationsStore } from "@/stores/notifications";
import * as Constants from "./Constants";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const baseUrl =
  import.meta.env.VITE_USER_API_BASE_URL ?? Constants.API_USER_LOCAL_URL;
const httpService = new ApiService(baseUrl);

class UserService {
  public static getUserClaimInfo() {
    return httpService
      .get<UserClaimDto>("v1/user/RetrieveUserBasicinfo")
      .then((response: UserClaimDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting reorders]: ", error);
        logger.error("[Error getting reorders]: ", error);
        return null;
      });
  }

  public static saveUser(user: UserDto) {
    return httpService
      .post<UserDto>("v1/user", user)
      .then((response: UserDto) => {
        return response;
      })
      .catch((error) => {
        const errorresp = error?.response?.data;
        const userNotificationsStore = useNotificationsStore();
        if (errorresp) {
          console.error(
            "[Validation Error while adding User]:",
            errorresp.detail,
          );
          logger.error(
            "[Validation Error while adding User]:",
            errorresp.detail,
          );
          userNotificationsStore.addNotification(
            Constants.FAILURE,
            errorresp.detail,
            {
              severity: "error",
            },
          );
          throw errorresp;
        }
        console.error("[Unhandled exception while adding user]:", error);
        logger.error("[Unhandled exception while adding user]:", error);
        userNotificationsStore.addNotification(
          Constants.FAILURE,
          Constants.SGS_ERROR_MSG,
          { severity: "error" },
        );
        throw error;
      });
  }

  public static searchUser(searchRequest: SearchRequestDto) {
    return httpService
      .post<SearchResponeDto>("v1/user/search", searchRequest)
      .then((response: SearchResponeDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error searching user]:", error);
        logger.error("[Error searching user]:", error);
        return null;
      });
  }

  public static searchPrinter(searchRequest: SearchRequestDto) {
    return httpService
      .post<SearchResponeDto>("v1/printer/printersearch", searchRequest)
      .then((response: SearchResponeDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error searching Printer]:", error);
        logger.error("[Error searching Printer]:", error);
        return null;
      });
  }

  public static getUserDetails(userId: string) {
    return httpService
      .get<UserDto>("v1/user/Retrieve?userId=" + userId)
      .then((response: UserDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting User Details]: ", error);
        logger.error("[Error getting User Details]: ", error);
        return null;
      });
  }

  public static SavePrinter(printerData: PrinterDto) {
    return httpService
      .post<PrinterDto>("v1/printer", printerData)
      .then((response: PrinterDto) => {
        return response;
      })
      .catch((error) => {
        const errorresp = error?.response?.data;
        const notificationsStore = useNotificationsStore();
        if (errorresp) {
          console.error("[Validation Error adding printer]:", errorresp.detail);
          logger.error("[Validation Error adding printer]:", errorresp.detail);
          notificationsStore.addNotification(
            Constants.FAILURE,
            errorresp.detail,
            {
              severity: "error",
            },
          );
          throw errorresp;
        }
        console.error("[Unhandled exception while adding printer]:", error);
        logger.error("[Unhandled exception while adding printer]:", error);
        notificationsStore.addNotification(
          Constants.FAILURE,
          Constants.SGS_ERROR_MSG,
          { severity: "error" },
        );
        throw error;
      });
  }

  public static DeleteUser(userId: string, printerId: string) {
    return httpService
      .delete<boolean>(
        "v1/user/Delete?userId=" +
          userId +
          "&isActive=false" +
          "&printerId=" +
          printerId,
      )
      .then((response: boolean) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error deleting user]:", error);
        logger.error("[Error deleting user]:", error);
        return null;
      });
  }

  public static ResendInvitation(userId: string) {
    return httpService
      .post<boolean>("v1/user/ResendInvitation?userId=" + userId)
      .then((response: boolean) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error resending invitation]:", error);
        logger.error("[Error resending invitation]:", error);
      });
  }

  public static GetExternalUserCount(userId: string, printerId: string) {
    return httpService
      .get<ExternalPrinterCountResponseDto>(
        "v1/user/RetrieveExternalUserPrinter?printerId=" +
          printerId +
          "&userId=" +
          userId,
      )
      .then((response: ExternalPrinterCountResponseDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting User Details]: ", error);
        logger.error("[Error getting User Details]: ", error);
        return null;
      });
  }
}
export default UserService;
