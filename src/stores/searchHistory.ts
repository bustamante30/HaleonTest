import { defineStore } from "pinia";
import type { SearchHistoryDto } from "@/models/SearchHistoryDto";
import type { SearchFieldDto } from "@/models/SearchFieldDto";
import SearchHistoryService from "@/services/searchHistoryService";
import type { SearchDateDto } from "@/models/SearchDateDto";

export const useSearchhistoryStore = defineStore("searchHistory", {
  state: () => ({
    searchFieldReference: [] as SearchFieldDto[],
    searchHistory: [] as SearchHistoryDto[], // Specify the type of colors
    searchDate: [] as SearchDateDto[]
  }),
  actions: {
    async getSearchHistory(dateRefId: number) {
      const history = await SearchHistoryService.getSearchHistory(dateRefId);
      this.searchHistory = history as SearchHistoryDto[];
    },
    async getSearchField() {
      const searchField = await SearchHistoryService.getSearchField();
      this.searchFieldReference = searchField as SearchFieldDto[];
    },
    async getSearchDate() {
      const searchDate = await SearchHistoryService.getSearchDate();
      this.searchDate = searchDate as SearchDateDto[];
    },
    async setSearchHistory(advanceSearchParameters: any) {
      let searchRequest: SearchHistoryDto[] = [];
      if (this.searchFieldReference.length > 0) {
        this.searchFieldReference.forEach((field) => {
          if (advanceSearchParameters[(field as any).fieldName]) {
            if (Array.isArray(advanceSearchParameters[(field as any).fieldName])) {
              if (advanceSearchParameters[(field as any).fieldName].join(',')) {
                searchRequest.push({
                  SearchFieldId: (field as any).id,
                  Value: advanceSearchParameters[(field as any).fieldName].join(',')
                })
              }
            } else {
              searchRequest.push({
                SearchFieldId: (field as any).id,
                Value: advanceSearchParameters[(field as any).fieldName]
              })
            }
          }
        })
        const result = await SearchHistoryService.setSearchHistory(searchRequest);
      }
    }
  },
});
