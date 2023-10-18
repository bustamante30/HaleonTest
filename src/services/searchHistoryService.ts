import type { SearchFieldDto } from "@/models/SearchFieldDto";
import ApiService from "../services/apiService";
import type { SearchHistoryDto } from "@/models/SearchHistoryDto";
import type { SearchDateDto } from "@/models/SearchDateDto";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5208/";

const httpService = new ApiService(baseUrl);

class SearchHistoryService {
  public static getSearchField() {
    return httpService
      .get<SearchFieldDto>("v1/Reorder/searchfield")
      .then((response: SearchFieldDto) => {
        return response;
      })
      .catch((error) => {
        console.log("error getting search field: ", error);
        return [];
      });
  }

  public static getSearchDate(isAdvanceSearch: boolean) {
    return httpService
      .get<SearchDateDto>(
        "v1/Reorder/getDate?isAdvanceSearch=" + isAdvanceSearch,
      )
      .then((response: SearchDateDto) => {
        return response;
      })
      .catch((error) => {
        console.log("error getting search field: ", error);
        return [];
      });
  }

  public static getSearchHistory(dateRefId: number, isAdvanceSearch: boolean) {
    return httpService
      .get<SearchHistoryDto>(
        "v1/Reorder/getHistory?dateRefId=" +
          dateRefId +
          "&&isAdvanceSearch=" +
          isAdvanceSearch,
      )
      .then((response: SearchHistoryDto) => {
        return response;
      })
      .catch((error) => {
        console.log("error getting search history: ", error);
        return [];
      });
  }

  public static setSearchHistory(
    history: SearchHistoryDto[],
    isAdvanceSearch: boolean,
  ) {
    return httpService
      .post<SearchHistoryDto>(
        "v1/Reorder/addhistory?isAdvanceSearch=" + isAdvanceSearch,
        history,
      )
      .then((response: SearchHistoryDto) => {
        return response;
      })
      .catch((error) => {
        console.log("error setting search history: ", error);
        return [];
      });
  }
}

export default SearchHistoryService;
