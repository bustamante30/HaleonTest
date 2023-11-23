import type { SearchFieldDto } from "@/models/SearchFieldDto";
import ApiService from "../services/apiService";
import type { SearchHistoryDto } from "@/models/SearchHistoryDto";
import type { SearchDateDto } from "@/models/SearchDateDto";
import * as Constants from "./Constants";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;

const httpService = new ApiService(baseUrl);

class SearchHistoryService {
  public static getSearchField() {
    return httpService
      .get<SearchFieldDto>("v1/Reorder/search-field")
      .then((response: SearchFieldDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting search field]: ", error);
        logger.error("[Error getting search field]: ", error);
        return [];
      });
  }

  public static getSearchDate(isAdvanceSearch: boolean) {
    return httpService
      .get<SearchDateDto>("v1/Reorder/date?isAdvanceSearch=" + isAdvanceSearch)
      .then((response: SearchDateDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting search field]: ", error);
        logger.error("[Error getting search field]: ", error);
        return [];
      });
  }

  public static getSearchHistory(dateRefId: number, isAdvanceSearch: boolean) {
    return httpService
      .get<SearchHistoryDto>(
        "v1/Reorder/history?dateRefId=" +
          dateRefId +
          "&&isAdvanceSearch=" +
          isAdvanceSearch,
      )
      .then((response: SearchHistoryDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error getting search history]: ", error);
        logger.error("[Error getting search history]: ", error);
        return [];
      });
  }

  public static setSearchHistory(
    history: SearchHistoryDto[],
    isAdvanceSearch: boolean,
  ) {
    return httpService
      .post<SearchHistoryDto>(
        "v1/Reorder/history?isAdvanceSearch=" + isAdvanceSearch,
        history,
      )
      .then((response: SearchHistoryDto) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error setting search history]: ", error);
        logger.error("[Error setting search history]: ", error);
        return [];
      });
  }
}

export default SearchHistoryService;
