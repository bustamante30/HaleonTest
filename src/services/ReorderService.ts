import type { ReorderDto } from '../models/ReorderDto';
import ApiService  from './apiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5208/';
const httpService = new ApiService(baseUrl)

class ReorderService {

    public static getRecentReorders(query?: string, advancedSearchParameters?: any) {
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
        if (advancedSearchParameters) {
            advancedSearchParameters.endDate = new Date()
            params["advancedSearchParameters"] = advancedSearchParameters
        }
       // return httpService.post<ReorderDto[]>("v1/Reorder/search", params)

       return httpService.post<any>('v1/Reorder/search', params).then((response) => {
        const reorderedData: ReorderDto[] = response.data.map((item: any) => {
          const reorderedItem: ReorderDto = {
            id: item.id,
            sgsId: item.sgsId,
            brandName: item.brandName,
            description: item.description,
            weight: item.weight,
            printerId: item.printerId,
            printerName: item.printerName,
            printerLocationId: item.printerLocationId,
            printerLocationName: item.printerLocationName,
            packStatus: item.orderStatus, // Renamed to packStatus to match DTO
            createdAt: item.createdAt ? new Date(item.createdAt) : null,
            submittedDate: item.submittedDate ? new Date(item.submittedDate) : null,
            cancelledDate: item.cancelledDate ? new Date(item.cancelledDate) : null,
            createdBy: item.createdBy,
            statusId: item.statusId,
            thumbNail: item.thumbNail,
          };
  
          return reorderedItem;
        });
  
        return reorderedData;
      });
    }

}

export default ReorderService;
