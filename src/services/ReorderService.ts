import { Console } from 'console';
import type { ReorderDto, SearchPagedResultDto } from '../models/ReorderDto';
import ApiService from '../services/apiService';

const baseUrl =  'http://localhost:5208/';

//import.meta.env.VITE_API_BASE_URL ??
const httpService = new ApiService(baseUrl)

class ReorderService {

    public static getRecentReorders(query?: string, sortBy?: string,
        sortOrder?: string,
        page?: number,
        pageSize?: number, advancedSearchParameters?: any, columnFilters? : any) {
          debugger;
        let params = {}
        if (query=="") {
             params = {
                "pageNumber": page,
                "pageCount": pageSize,
                "printerId": 1,
                "brandName": columnFilters!= null?columnFilters.state.brandNameFilter !=null?columnFilters.state.brandNameFilter: null:null,
                "packType": columnFilters!= null?columnFilters.state.packTypeFilter !=null?columnFilters.state.packTypeFilter: null:null,
                "Description": columnFilters!= null?columnFilters.state.descriptionFilter !=null?columnFilters.state.descriptionFilter: null:null,
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
           console.log("brandNameFilter:"+advancedSearchParameters);
           console.log("TotalRecords:"+ totalRecords);
           console.log("reorderedData:"+ reorderedData);
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
 }

export default ReorderService;
