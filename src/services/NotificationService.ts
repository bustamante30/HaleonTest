import ApiService from "./apiService";
import * as Constants from "./Constants";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;
const httpService = new ApiService(baseUrl);

export class NotificationService {
  public static getNotification() {
    return httpService
      .get("v1/notification")
      .then((response) => {
        return response;
      })
      .catch((error) => {
        logger.error("[Error in Notification]:", error);
        return false;
      });
  }
}
