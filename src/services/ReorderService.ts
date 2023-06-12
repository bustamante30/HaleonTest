import type { ReorderDto } from '../models/ReorderDto';
import ApiService  from './apiService';

const baseUrl = "http://localhost:5208/"
const httpService = new ApiService(baseUrl)

class ReorderService {

    public static getRecentReorders() {
        let params = {
            "pageNumber": 1,
            "pageCount": 10,
            "printerId": 1
        }
        return httpService.post<ReorderDto[]>("v1/Reorder/search", params)
    }

}

export default ReorderService;
