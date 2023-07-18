import { defineStore } from "pinia";
import type { SearchHistoryDto } from "@/models/SearchHistoryDto";
import type { SearchFieldDto } from "@/models/SearchFieldDto";
import SearchHistoryService from "@/services/searchHistoryService";

export const useSearchhistoryStore = defineStore("searchHistory", {
  state: () => ({
    searchFieldReference: [] as SearchFieldDto[],
    searchHistory: [] as SearchHistoryDto[], // Specify the type of colors
  }),
  actions: {
    async getSearchHistory(userId: any) {
      const history = await SearchHistoryService.getSearchHistory(userId);
      this.searchHistory = history as SearchHistoryDto[];
    },
    async getSearchField() {
      const searchField = await SearchHistoryService.getSearchField();
      this.searchFieldReference = searchField as SearchFieldDto[];
    },
    async setSearchHistory(advanceSearchParameters: any) {
      console.log('searchFieldReference', this.searchFieldReference)
      let searchRequest: SearchHistoryDto[] = [];
      if (this.searchFieldReference.length > 0) {
        this.searchFieldReference.forEach((field) => {
          if (Array.isArray(advanceSearchParameters[(field as any).fieldName]) && advanceSearchParameters[(field as any).fieldName]!==null) {
            const joinedDate = advanceSearchParameters[(field as any).fieldName].join(',')
            searchRequest.push({
              SearchFieldId: (field as any).id,
              Value: joinedDate
            })
          } else {
            searchRequest.push({
              SearchFieldId: (field as any).id,
              Value: advanceSearchParameters[(field as any).fieldName]
            })
          }
        })
        console.log('searchRequest', searchRequest)
        const result = await SearchHistoryService.setSearchHistory(searchRequest);
        console.log(result);
      }
    }
  },
});
