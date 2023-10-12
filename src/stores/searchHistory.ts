import { defineStore } from "pinia";
import type { SearchHistoryDto } from "@/models/SearchHistoryDto";
import type { SearchFieldDto } from "@/models/SearchFieldDto";
import SearchHistoryService from "@/services/searchHistoryService";
import type { SearchDateDto } from "@/models/SearchDateDto";

export const useSearchhistoryStore = defineStore("searchHistory", {
  state: () => ({
    searchFieldReference: [] as SearchFieldDto[],
    searchHistory: [] as SearchHistoryDto[],
    searchDate: [] as SearchDateDto[],
  }),
  actions: {
    async getSearchHistory(dateRefId: number, isAdvanceSearch: boolean) {
      const history = await SearchHistoryService.getSearchHistory(
        dateRefId,
        isAdvanceSearch,
      );
      this.searchHistory = history as SearchHistoryDto[];
    },
    async getSearchField() {
      const searchField = await SearchHistoryService.getSearchField();
      this.searchFieldReference = searchField as SearchFieldDto[];
    },
    async getSearchDate(isAdvanceSearch: boolean) {
      const searchDate =
        await SearchHistoryService.getSearchDate(isAdvanceSearch);
      this.searchDate = searchDate as SearchDateDto[];
    },
    async setSearchHistory(
      advanceSearchParameters: any,
      isAdvanceSearch: boolean,
    ) {
      const searchRequest: SearchHistoryDto[] = [];
      if (this.searchFieldReference.length > 0) {
        this.searchFieldReference.forEach((field) => {
          if (advanceSearchParameters[(field as any).fieldName]) {
            if (
              Array.isArray(advanceSearchParameters[(field as any).fieldName])
            ) {
              if (advanceSearchParameters[(field as any).fieldName].join(",")) {
                searchRequest.push({
                  SearchFieldId: (field as any).id,
                  Value:
                    advanceSearchParameters[(field as any).fieldName].join(","),
                });
              }
            } else {
              searchRequest.push({
                SearchFieldId: (field as any).id,
                Value: advanceSearchParameters[(field as any).fieldName],
              });
            }
          }
        });
        const result = await SearchHistoryService.setSearchHistory(
          searchRequest,
          isAdvanceSearch,
        );
      }
    },
    async setKeywordSearchHistory(
      keywordSearchValue: any,
      isAdvanceSearch: boolean,
    ) {
      if (keywordSearchValue === "") {
        return;
      }

      const searchRequest: SearchHistoryDto[] = this.searchFieldReference
        .filter((field: any) => field.fieldName === "keywordSearch")
        .map((field: any) => ({
          SearchFieldId: field.id,
          Value: keywordSearchValue,
        }));
      if (searchRequest.length > 0) {
        const result = await SearchHistoryService.setSearchHistory(
          searchRequest,
          isAdvanceSearch,
        );
      }
    },
  },
});
