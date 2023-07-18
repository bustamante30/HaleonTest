import type { SearchFieldDto } from '@/models/SearchFieldDto';
import ApiService from '../services/apiService';
import type { SearchHistoryDto } from '@/models/SearchHistoryDto';

const baseUrl = 'http://localhost:5208/';

const httpService = new ApiService(baseUrl)

class SearchHistoryService {

    public static getSearchField() {
        return httpService.get<SearchFieldDto>("v1/Reorder/searchfield").then((response: SearchFieldDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting search field: ", error);
            return []
        });
    }

    public static getSearchHistory(userId: any) {
        return httpService.get<SearchHistoryDto>("v1/Reorder/getHistory", userId).then((response: SearchHistoryDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting search history: ", error);
            return []
        });
    }

    public static setSearchHistory(history: any) {
        return httpService.post<SearchHistoryDto>('v1/Reorder/search', history).then((response: SearchHistoryDto) => {
            return response
        }).catch((error: any) => {
            console.log("error setting search history: ", error);
            return []
        });
    }

}

export default SearchHistoryService;
