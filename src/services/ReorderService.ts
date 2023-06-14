import type { ReorderDto } from '../models/ReorderDto';
import ApiService  from './apiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5208/';
const httpService = new ApiService(baseUrl)

class ReorderService {

    public static getRecentReorders(query?: string) {
        let params = {}
        if (query=="") {
             params = {
                "pageNumber": 1,
                "pageCount": 10,
                "printerId": 1
            }
        }
       else {
            params = {
                "pageNumber": 1,
                "pageCount": 10,
                "printerId": 1,
                "searchText": query
            }
        }
        return httpService.post<ReorderDto[]>("v1/Reorder/search", params)
    }

}

export default ReorderService;
