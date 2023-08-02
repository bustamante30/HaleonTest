import type { ReorderDto } from '../models/ReorderDto';
import ApiService from '../services/apiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ??'http://localhost:5208/';

const httpService = new ApiService(baseUrl)

interface SearchPagedResultDto {
    data: ReorderDto[];
    totalRecords: number;
} 

interface SubmitReorderResponse {
    success?: boolean;
    result?: SubmitReorder;
}
interface SubmitReorder {
    Id?: number;
    OriginalOrderId: string;
    BrandName: string;
    Description: string;
    Weight: string;
    ItemCode: string;
    PrinterName: string;
    PrinterId: number;
    PrinterLocationName: string;
    PackType: string;
    StatusId: number;
    ExpectedDate: Date;
    Notes: string;
    PO: string;
    CreatedBy?:number;
    PlateRelief: string;
    ThumbNailPath: string;
    Variety: string;
    colors: Color[];
    CustomerContacts: CustomerContact[];
}
interface Color {
    mcgColourId: number;
    colourName: string;
    sequenceNumber: number;
    clientPlateColourRef: string;
    custCarrierIdNo: string;
    custImageIdNo: string;
    imageCarrierId: string;
    sets: number;
    plateTypeId: number;
    plateTypeDescription: string;
    plateThicknessId: number;
    plateThicknessDescription: string;
    colourType: number;
    colourTypeDesc?: string;
    isNew: boolean;
    newColour?: string;
    commonColourRef: string;
    isActive: boolean;
}
interface CustomerContact {
    alias: string;
    customerContactId: string;
    customerId: string;
    customerName: string;
    shippingAddress: string;
    siteName: string;
    isActive: boolean;
}
class ReorderService {
    public static async updateDraft(reorder: any):Promise<SubmitReorderResponse> {
        reorder.colors.forEach((color: any) => {
            color.isActive = color.sets > 0 ? true : false
        })
        return await httpService
            .post<SubmitReorderResponse>('v1/Reorder/updateDraft', reorder)
            .then((response: SubmitReorderResponse) => {
                console.log('updated Order:')
                this.decorateColours(response.result?.colors)
                console.log(response.result);
                return response;
            })
            .catch((error: any) => {
                console.log('Error submitting reorder:', error);
                let x: SubmitReorderResponse ={success : false};
                return x;
            });
    }
    public static submitReorder(reorderInfo: any, statusId: number) {
        let newReorder: SubmitReorder = {
            OriginalOrderId: reorderInfo.sgsId,
            BrandName: reorderInfo.brandName,
            Description: reorderInfo.description,
            Weight: reorderInfo.weight,
            ItemCode: reorderInfo.itemCode,
            PrinterId: 1,
            PrinterName: reorderInfo.printerName,
            PrinterLocationName: reorderInfo.printerLocationName,
            PackType: reorderInfo.packType,
            StatusId: statusId,
            ThumbNailPath: reorderInfo.thumbNailPath,
            Variety: reorderInfo.variety,
            PO: reorderInfo.PO,
            ExpectedDate: reorderInfo.expectedDate? reorderInfo.expectedDate:new Date(),
            Notes: reorderInfo.Notes,
            PlateRelief: reorderInfo.PlateRelief,
            colors: [],
            CustomerContacts: []
        }
        reorderInfo.colors.forEach((color: any) => {
            let isActiveColor: boolean = color.sets > 0 ? true : false
            newReorder.colors.push({
                clientPlateColourRef: color.clientPlateColourRef,
                colourName: color.colourName,
                custCarrierIdNo: color.custCarrierIdNo,
                custImageIdNo: color.custImageIdNo,
                imageCarrierId: color.imageCarrierId,
                mcgColourId: color.mcgColourId,
                plateThicknessDescription: color.plateThicknessDescription,
                plateThicknessId: color.plateThicknessId,
                plateTypeDescription: color.plateTypeDescription,
                plateTypeId: color.plateTypeId,
                sequenceNumber: color.sequenceNumber,
                sets: color.sets,
                colourType: color.colourType,
                isNew: color.isNew,
                commonColourRef: color.commonColourRef,
                isActive: isActiveColor
            })
        })
        reorderInfo.customerContacts.forEach((contact: any) => {
            newReorder.CustomerContacts.push(
                {
                    alias: contact.alias,
                    customerContactId: contact.customerContactId,
                    customerId: contact.customerId,
                    customerName: contact.customerName,
                    siteName: contact.siteName,
                    shippingAddress: contact.shippingAddress ? contact.shippingAddress : "",
                    isActive: contact.isActive
                })
        })
        return httpService
            .post<SubmitReorderResponse>('v1/Reorder/submitReorder', newReorder)
            .then((response: SubmitReorderResponse) => {
                this.decorateColours(response.result?.colors)
                return response.result;                    
            })
            .catch((error: any) => {
                console.log('Error submitting reorder:', error);
                return false;
            });
    }
    public static getRecentReorders(status: number, query?: string, sortBy?: string,
        sortOrder?: string,
        page?: number,
        pageSize?: number, advancedSearchParameters?: any, columnFilters? : any) {
        let params = {}
        if (query=="") {
             params = {
                "status" :status,
                "pageNumber": page,
                "pageCount": pageSize,
                "printerId": 1,
                "brandName": columnFilters!= null?columnFilters.state.brandNameFilter !=null?columnFilters.state.brandNameFilter: null:null,
                "packType": columnFilters!= null?columnFilters.state.packTypeFilter !=null?columnFilters.state.packTypeFilter: null:null,
                "Description": columnFilters!= null?columnFilters.state.descriptionFilter !=null?columnFilters.state.descriptionFilter: null:null,
                "orderStatusId": status,
                "OrderBy":  columnFilters!= null?columnFilters.state.sortFields !=null?columnFilters.state.sortFields: null:null,
                "OrderByAsc":  columnFilters!= null?columnFilters.state.sortOrder !=null?columnFilters.state.sortOrder: true:true,
                
            }
        }
       else {
            params = {
                "status" :status,
                "pageNumber": page,
                "pageCount": pageSize,
                "printerId": 1,
                "searchText": query,
                "brandName": columnFilters!= null?columnFilters.state.brandNameFilter !=null?columnFilters.state.brandNameFilter: null:null,
                "packType": columnFilters!= null?columnFilters.state.packTypeFilter !=null?columnFilters.state.packTypeFilter: null:null,
                "Description": columnFilters!= null?columnFilters.state.descriptionFilter !=null?columnFilters.state.descriptionFilter: null:null,
                "orderStatusId": status,
                "OrderBy":  columnFilters!= null?columnFilters.state.sortFields !=null?columnFilters.state.sortFields: null:null,
                "OrderByAsc":  columnFilters!= null?columnFilters.state.sortOrder !=null?columnFilters.state.sortOrder: true:true,
                
            }
        }

        if (advancedSearchParameters) {
            if (advancedSearchParameters.startDate != null) {
                let dateRange = Object.assign < Array<Date>, Array<Date>>([], advancedSearchParameters.startDate);
                advancedSearchParameters.startDate = dateRange[0];
                advancedSearchParameters.endDate = dateRange[1];
                (params as any)["advancedSearchParameters"] = advancedSearchParameters
            }
            if (advancedSearchParameters.printerName)
            {
            (params as any)["advancedSearchParameters"] = advancedSearchParameters
            }
        }
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
               thumbNailPath: item.thumbNailPath,
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
            console.log(response)
            return response
        }).catch((error: any) => {
            console.log("error getting reorders: ", error);
            return null;
        });
    }

    public static getCartCount() {
        return httpService.get<any>('v1/Reorder/getCartCount').then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting cart count: ", error);
            return 0;
        });
    }
    public static getCart() {
        return httpService.get<any>('v1/Reorder/getUserCart').then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting cart: ", error);
            return 0;
        });
    }
    public static discardOrder(id: string) {
        return httpService.post<any>('v1/Reorder/discardOrder/'+id).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error discarding order: ", error);
            return false
        });
    }
    public static getColorType(colourType: number){
        switch(colourType){
            case 2: return "Tone"
            case 0: return "Unknown"
            case 5: return "Combo-L/T"
            case 1: return "Line"
            case 11: return "Technical"
            default: return ""
        }
    }
    public static decorateColours(colors: Color[] | undefined){
        if(colors)
            colors.forEach(color =>{
                color.colourTypeDesc = this.getColorType(color.colourType)
                color.newColour = color.isNew? "New":"Common"
            })
    }
}

export default ReorderService;
