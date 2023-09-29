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

type Reorderdoc = {
    fileName : string;
    url: string
}
interface SubmitReorder {
    id: number;
    originalOrderId: string;
    brandName: string;
    description: string;
    weight: string;
    itemCode: string;
    printerName: string;
    printerId: number;
    packType: string;
    statusId: number;
    expectedDate: Date;
    notes: string;
    PO: string;
    createdBy?:number;
    plateRelief: string;
    thumbNailPath: string;
    variety: string;
    isActive: boolean;
    colors: Color[];
    customerContacts: CustomerContact[];
    reorderDocs: Reorderdoc[];
    packagingReference: string
}

interface PlateType {
    id: number;
    reorderColourPlateTypeId: number;
    plateTypeId: number;
    plateType: string;
    plateThicknessId: number;
    plateThickness: string;
    sets: number;
    isActive: boolean;
}
interface Color {
    id: number;
    jobTechSpecColourId: number;
    colourName: string;
    sequenceNumber: number;
    clientPlateColourRef: string;
    custCarrierIdNo: string;
    custImageIdNo: string;
    imageCarrierId: string;
    serialNumber: number;
    sets: number;
    originalSets: number;
    plateTypeId: number;
    plateTypeDescription: string;
    plateThicknessId: number;
    plateThicknessDescription: string;
    colourType: string;
    isNew: boolean;
    newColour?: string;
    commonColourRef: string;
    isActive: boolean;
    totalSets?: number;
    plateTypes?: PlateType[];
}

interface CustomerContact {
    id: number;
    alias: string;
    customerContactId: string;
    sgsCustomerId: string;
    customerName: string;
    shippingAddress: string;
    siteName: string;
    isActive: boolean;
}
class ReorderService {
    
    public static submitReorder(reorderInfo: any, statusId: number, isUpdate?: boolean) {
        const newColors = JSON.parse(JSON.stringify(reorderInfo.colors))
        const newContacts = [] as any[]
        ///code added to resolve the iisue with the plate details:
        newColors.forEach((color: any) => {
            color?.plateType?.forEach((plateType: any) => {
                let plateInfo = plateType.plateTypeDescription
                plateType.plateTypeId = plateInfo.value
                plateType.plateThicknessDescription = plateInfo.plateThicknessDescription
                plateType.plateThicknessId = plateInfo.plateThicknessId
                plateType.plateTypeDescription = plateInfo.label
            })
            ///api expects plateTypes and sets fields:
            color.plateTypes = color.plateType
            color.sets = color.totalSets
        })
        reorderInfo.customerContacts.forEach((contact: any) => {
            newContacts.push(
                {
                    id: isUpdate? contact.id : 0, 
                    alias: contact.alias,
                    customerContactId: contact.customerContactId,
                    sgsCustomerId: contact.customerId,
                    customerName: contact.customerName,
                    siteName: contact.siteName,
                    shippingAddress: contact.shippingAddress ? contact.shippingAddress : "",
                    isActive: contact.isActive
                })
        })
        let newReorder: SubmitReorder = {
            id: isUpdate ? reorderInfo.id : 0,
            originalOrderId: isUpdate ? reorderInfo.originalOrderId : reorderInfo.sgsId,
            brandName: reorderInfo.brandName,
            description: reorderInfo.description,
            weight: reorderInfo.weight,
            itemCode: reorderInfo.itemCode,
            printerId: 1,
            printerName: reorderInfo.printerName,
            packType: reorderInfo.packType,
            statusId: statusId,
            thumbNailPath: reorderInfo.thumbNailPath,
            variety: reorderInfo.variety,
            PO: reorderInfo.PO,
            expectedDate: reorderInfo.expectedDate ? reorderInfo.expectedDate : new Date(),
            notes: reorderInfo.Notes,
            plateRelief: reorderInfo.plateRelief,
            reorderDocs: reorderInfo.reorderDocs,
            isActive: reorderInfo.isActive,
            colors: [...newColors],
            customerContacts: [...newContacts],
            packagingReference: reorderInfo.packagingReference
        }

        console.log('newReorder',newReorder)
        return httpService
            .post<SubmitReorderResponse>('v1/Reorder/submitReorder', newReorder)
            .then((response: SubmitReorderResponse) => {
                this.decorateColours(response.result?.colors)
                return response;
            })
            .catch((error: any) => {
                console.log('Error submitting reorder:', error);
                return false;
            });
    }
    public static getRecentReorders(status: number, query?: string, sortBy?: string,
        sortOrder?: string,
        page?: number,
        pageSize?: number, filters?: any, columnFilters? : any, printerNames?:string[], printerUserIds?:number[]) {
        let params = {}
        const advancedSearchParameters = JSON.parse(JSON.stringify(filters))
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
                "OrderBy":  sortBy!= null?sortBy:null,
                "OrderByAsc":  sortOrder!= null?sortOrder:true,
                "printerName":printerNames?printerNames : [],
                "roleKey": advancedSearchParameters.roleKey,
                printerUserIds: printerUserIds
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
                "OrderBy":  sortBy!= null?sortBy:null,
                "OrderByAsc":  sortOrder!= null?sortOrder:true,
                "printerName":printerNames?printerNames : [],
                "roleKey": advancedSearchParameters.roleKey,
                printerUserIds: printerUserIds
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
       .post<SearchPagedResultDto>('v1/Reorder/search', params, undefined, true)
       .then((response: SearchPagedResultDto) => {
         const reorderedData: ReorderDto[] = response.data
           ? response.data.map((item: ReorderDto) => ({
               id: item.id,
               sgsId: item.sgsId!=null?item.sgsId:(item.id?item.id.toString():''),
               brandName: item.brandName,
               description: item.description,
               weight: item.weight,
               printerId: item.printerId,
               printerName: item.printerName,
               packType: item.packType, // Renamed to packStatus to match DTO
               createdAt: item.createdAt ? item.createdAt : null,
               submittedDate: item.submittedDate ? item.submittedDate : null,
               cancelledDate: item.cancelledDate ? item.cancelledDate : null,
               orderStatus: item.orderStatus ? item.orderStatus : null,
               createdBy: item.createdBy,
               statusId: item.statusId,
               thumbNailPath: new URL("@/assets/images/no_thumbnail.png", import.meta.url).pathname,
               itemCode: item.itemCode,
               originalOrderId: item.originalOrderId,
             }))
           : [];
 
           const totalRecords: number = response.totalRecords ?? 1000;
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
    public static getPhotonReorderDetails(id: string) {
        return httpService.get<any>('v1/Reorder/getPhotonReorderDetails?orderId=' + id).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting photon reorder: ", error);
            return null;
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

    public static cancelOrder(orderId: number, isActive: boolean){
        return httpService
          .delete<boolean>('v1/Reorder/cancel?orderId='+ orderId +'&isActive='+ isActive +'')
          .then((response: boolean) => {
            return response;
          })
            .catch((error: any) => {
                console.log('Error deleting order:', error);
                return false;
              });
    }

    public static getThumbnail(sgsId: string) {        
        return httpService
        .get<string>(`v1/Reorder/${sgsId.split('-')[0]}/thumbnail`)
        .then((response: string) => {
          return response;
        })
          .catch((error: any) => {
              console.log('Error getting thumbnail:', error);
              return false;
            });
    }

    
    public static decorateColours(colors: Color[] | undefined){
        if(colors)
            colors.forEach(color =>{
                color.plateTypes = color.plateTypes?.sort((a,b)=> a.plateTypeId - b.plateTypeId)
                color.newColour = color.isNew? "New":"Common"
                color.imageCarrierId = color.custImageIdNo?color.custImageIdNo:(color.custCarrierIdNo?color.custCarrierIdNo:color.imageCarrierId)
                color.totalSets = color.sets
            })
    }

    public static getPhotonBarcode(id: number) {
        return httpService.get<any>('v1/Reorder/barcode?photonId='+ id).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting barcode: ", error);
            return 0;
        });
    }

     public static getPhotonShirttail(id: number) {
        return httpService.get<any>('v1/Reorder/shirttail?photonId='+ id).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting shirttail: ", error);
            return 0;
        });
    }

    public static getReorderAudit(id: number) {
        return httpService.get<any>('v1/audit/reorder/'+ id).then((response: any) => {
            return response
        }).catch((error: any) => {
            console.log("error getting shirttail: ", error);
            return 0;
        });
    }

    public static async validateOrder(jobNo: string){
        return httpService
          .post<boolean>('v1/Reorder/info/ValidateOrder?jobnumber='+ jobNo)
          .then((response: boolean) => {
            return response;
          })
            .catch((error: any) => {
                console.log('Error while validate order service:', error);
                return false;
              });
    }

}

export default ReorderService;
