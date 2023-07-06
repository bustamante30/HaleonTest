import type { ReorderDto, SearchPagedResultDto } from '../models/ReorderDto';
import ApiService from '../services/apiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ??'http://localhost:5208/';

//import.meta.env.VITE_API_BASE_URL ??
const httpService = new ApiService(baseUrl)

class ReorderService {

    public static getRecentReorders(query?: string, sortBy?: string,
        sortOrder?: string,
        page?: number,
        pageSize?: number, advancedSearchParameters?: any, columnFilters? : any) {
        let params = {}
        if (query=="") {
             params = {
                "pageNumber": page,
                "pageCount": pageSize,
                "printerId": 1,
                "brandName": columnFilters!= null?columnFilters.state.brandNameFilter !=null?columnFilters.state.brandNameFilter: null:null,
                "packType": columnFilters!= null?columnFilters.state.packTypeFilter !=null?columnFilters.state.packTypeFilter: null:null,
                "Description": columnFilters!= null?columnFilters.state.descriptionFilter !=null?columnFilters.state.descriptionFilter: null:null,
                "orderStatusId": columnFilters!= null?columnFilters.state.orderStatusFilter !=null?columnFilters.state.orderStatusFilter: null:null,
                "OrderBy":  columnFilters!= null?columnFilters.state.sortFields !=null?columnFilters.state.sortFields: null:null,
                "OrderByAsc":  columnFilters!= null?columnFilters.state.sortOrder !=null?columnFilters.state.sortOrder: true:true,
                
            }
        }
       else {
            params = {
                "pageNumber": page,
                "pageCount": pageSize,
                "printerId": 1,
                "searchText": query,
                "brandName": columnFilters!= null?columnFilters.state.brandNameFilter !=null?columnFilters.state.brandNameFilter: null:null,
                "packType": columnFilters!= null?columnFilters.state.packTypeFilter !=null?columnFilters.state.packTypeFilter: null:null,
                "Description": columnFilters!= null?columnFilters.state.descriptionFilter !=null?columnFilters.state.descriptionFilter: null:null,
                "orderStatusId": columnFilters!= null?columnFilters.state.orderStatusFilter !=null?columnFilters.state.orderStatusFilter: null:null,
                "OrderBy":  columnFilters!= null?columnFilters.state.sortFields !=null?columnFilters.state.sortFields: null:null,
                "OrderByAsc":  columnFilters!= null?columnFilters.state.sortOrder !=null?columnFilters.state.sortOrder: true:true,
                
            }
        }

        if (advancedSearchParameters) {
            if (advancedSearchParameters.startDate != null) {
                advancedSearchParameters.endDate = advancedSearchParameters.startDate[1]
                advancedSearchParameters.startDate = advancedSearchParameters.startDate[0]
            }
        }
       // return httpService.post<ReorderDto[]>("v1/Reorder/search", params)
       return httpService
       .post<SearchPagedResultDto>('v1/Reorder/search', params)
       .then((response: SearchPagedResultDto) => {
         const reorderedData: ReorderDto[] = response.data
           ? response.data.map((item: ReorderDto) => ({
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
               itemCode: item.itemCode,
             }))
           : [];
 
           const totalRecords: number = response.totalRecords ?? 0;
           return {
            reorderedData,
            totalRecords,
          };
       })
       .catch((error: any) => {
         console.log('Error getting reorders:', error);
         return [];
       });
    }

    public static getOrderDetails(sgsId: string) {
        return httpService.get<any>('v1/Reorder/info?jobnumber=' + sgsId).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting reorders: ", error);
            return null;
        });
    }
}

export default ReorderService;
