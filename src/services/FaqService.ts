import ApiService from "../services/apiService";
import * as Constants from "./Constants";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;
const httpService = new ApiService(baseUrl);

export class FaqService {
  public static getFaq() {
    return httpService
      .get("v1/Faq")
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error in FAQ]:", error);
        return false;
      });
  }
}
