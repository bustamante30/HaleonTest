import type { ReorderDto } from '../models/ReorderDto';
import ApiService  from './ApiService';

const baseUrl =  import.meta.env.VITE_API_BASE_URL ??'http://localhost:5208/';
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
            if (advancedSearchParameters.startDate != null) {
                advancedSearchParameters.endDate = advancedSearchParameters.startDate[1]
                advancedSearchParameters.startDate = advancedSearchParameters.startDate[0]
            }
            (params as any)["advancedSearchParameters"] = advancedSearchParameters
        }
       // return httpService.post<ReorderDto[]>("v1/Reorder/search", params)
        console.log("advancedSearchParameters"+params)
        return httpService.post<any>('v1/Reorder/search', params).then((response: any) => {
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
                   packType: item.packType, // Renamed to packStatus to match DTO
                   createdAt: item.createdAt ? item.createdAt : null,
                   submittedDate: item.submittedDate ? item.submittedDate : null,
                   cancelledDate: item.cancelledDate ? item.cancelledDate : null,
                   orderStatus: item.orderStatus ? item.orderStatus : null,
                   createdBy: item.createdBy,
                   statusId: item.statusId,
                   thumbNail: item.thumbNail,
                   itemCode: item.itemCode
               };

               return reorderedItem;
           });
  
        return reorderedData;
       }).catch((error: any) => {
           console.log("error getting reorders: ", error);
           return [];
       });
    }

}

export default ReorderService;
