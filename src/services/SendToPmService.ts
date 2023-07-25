import type { UploadFileDto } from '@/models/UploadFileDto';
import type { DeleteFileDto } from '@/models/DeleteFileDto';
import ApiService from '../services/apiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5208/';

const httpService = new ApiService(baseUrl)



interface SubmitResponse {
    success: boolean;
}

interface SendToPM {
    brand?: number;
    packType?: string;
    itemNumber?: string;
    codeType?: string;
    productDescription?: string;
    purchaseOrderNumber?: string;
    printerPlateCode?: string;
    mySGSOrderId?: number;
    comments?: string,
    colors: Color[];
    files?: files
    code: string
   
}
interface Color {
    colourName: string;
    sets: number;
}

interface files{
    fileName:string;
    publicStoragePath: string;
    privateStoragePath: string;
    checkSum: number;
    metadata: string;
}

class SendToPMService {

    public static submitExitOrder(exitOrderInfo: any) {

        console.log("service",exitOrderInfo)
        let newExitOrder: SendToPM = {
            brand: exitOrderInfo.brand,
            packType: exitOrderInfo.packType,
            itemNumber: exitOrderInfo.itemCode,
            codeType: exitOrderInfo.carrierCode.type,
            productDescription: exitOrderInfo.description,
            purchaseOrderNumber: exitOrderInfo.purchaseOrder,
            printerPlateCode: exitOrderInfo.plateId,
            mySGSOrderId: exitOrderInfo.jobNumber,
            comments: exitOrderInfo.comments,
            files:exitOrderInfo.files,
            code:exitOrderInfo.carrierCode.code,
            colors: [],
        }
        if (exitOrderInfo.colors && Array.isArray(exitOrderInfo.colors)) {
            exitOrderInfo.colors.forEach((color: any) => {
                if (typeof color === 'object' && color !== null) {
                    // Make sure the required properties are present
                    if (typeof color.colourName === 'string' && typeof color.sets === 'number') {
                        newExitOrder.colors.push({
                            colourName: color.colourName,
                            sets: color.sets,
                        });
                    } else {
                        console.log('Invalid color object:', color);
                    }
                } else {
                    console.log('Invalid color:', color);
                }
            });
        } else {
            console.log('Invalid colors array:', exitOrderInfo.colors);
        }
       
        console.log(newExitOrder)
        return httpService
            .post<boolean>('v1/pmexit/addexitorders', newExitOrder)
            .then((response: boolean) => {
                console.log('submitted Exit  Order:')

                return response;                    
            })
            .catch((error: any) => {
                console.log('Error submitting Exit Order:', error);
                return false;
            });
    }

    public static uploadFilesToBlobStorage(uploadInfo: any) {
        let uploadRequest: UploadFileDto = {
            FileName: uploadInfo.FileName,
            Data: uploadInfo.Data,
            UserId: uploadInfo.UserId
        }
        return httpService
            .post<boolean>('v1/upload', uploadRequest)
            .then((response: boolean) => {
                console.log('Upload Successfully')
                return response;
            })
            .catch((error: any) => {
                console.log('Error submitting files:', error);
                return false;
            });
    }

    public static deleteFilesToBlobStorage(deleteInfo: any) {
        let deleteRequest: DeleteFileDto = {
            FileName: deleteInfo.FileName,
            UserId: deleteInfo.UserId
        }
        return httpService
            .delete<boolean>('v1/delete', deleteRequest)
            .then((response: boolean) => {
                console.log('Deleted Successfully')
                return response;
            })
            .catch((error: any) => {
                console.log('Error submitting files:', error);
                return false;
            });
    }
}

export default SendToPMService;
