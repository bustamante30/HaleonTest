import ApiService from "../services/apiService";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5208/";
const httpService = new ApiService(baseUrl);

export class FaqService {
  public static getFaq() {
    return httpService
      .get("v1/Faq")
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error submitting files]:", error);
        return false;
      });
  }
}
