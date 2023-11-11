/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AiCustomerSearchDto } from "../models/AiCustomerSearchDto";
import ApiService from "../services/apiService";
import * as Constants from "./Constants";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;
const httpService = new ApiService(baseUrl);

class SuggesterService {
  public static getPrinterList(query: string) {
    return httpService
      .get<AiCustomerSearchDto>("v1/suggester", {
        query: query,
      })
      .then((response: any) => {
        return response.suggestions;
      })
      .catch((error: any) => {
        console.error("[Error getting printer suggestions]: ", error);
        return [];
      });
  }

  public static getPrinterSiteList(printerName?: string, query?: string) {
    return httpService
      .get<AiCustomerSearchDto>("v1/suggester/search", {
        query: query,
        printer_name: printerName,
      })
      .then((response: any) => {
        return response.suggestions;
      })
      .catch((error: any) => {
        console.error("[Error getting printer site suggestions]: ", error);
        return [];
      });
  }
}

export default SuggesterService;
