import type { SearchFieldDto } from '@/models/SearchFieldDto';
import ApiService from '../services/apiService';
import type { SearchHistoryDto } from '@/models/SearchHistoryDto';
import type { SearchDateDto } from '@/models/SearchDateDto';

const baseUrl = import.meta.env.VITE_API_BASE_URL ??'http://localhost:5208/';

const httpService = new ApiService(baseUrl)

class SearchHistoryService {

    public static getSearchField() {
        return httpService.get<SearchFieldDto>("v1/Reorder/searchfield").then((response: SearchFieldDto) => {
            console.log('api', response)
            return response
        }).catch((error: any) => {
            console.log("error getting search field: ", error);
            return []
        });
    }

    public static getSearchDate() {
        return httpService.get<SearchDateDto>("v1/Reorder/getDate").then((response: SearchDateDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting search field: ", error);
            return []
        });
    }

    public static getSearchHistory(dateRefId: number) {
        return httpService.get<SearchHistoryDto>("v1/Reorder/getHistory",{'dateRefId': dateRefId}).then((response: SearchHistoryDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting search history: ", error);
            return []
        });
    }

    public static setSearchHistory(history: any) {
        return httpService.post<SearchHistoryDto>('v1/Reorder/addhistory', history).then((response: SearchHistoryDto) => {
            return response
        }).catch((error: any) => {
            console.log("error setting search history: ", error);
            return []
        });
    }

}

export default SearchHistoryService;
