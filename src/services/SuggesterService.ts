import { AiCustomerSearchDto } from '../models/AiCustomerSearchDto';
import ApiService from '../services/ApiService';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5208/';
const httpService = new ApiService(baseUrl)

class SuggesterService {

    public static getPrinterList(query: string) {
        return httpService.get<AiCustomerSearchDto>("v1/suggester", {
            'query': query
        }).then((response:any) => { return response.suggestions }).catch ((error: any) => {
            console.log("error getting printer suggestions: ", error);
            return []
        });
    }

    public static getPrinterSiteList(
        printerName?: string,
        query?: string) {
        return httpService.get<AiCustomerSearchDto>("v1/suggester/search", {
            'query': query,            
            'printer_name': printerName
        }).then((response: any) => { return response.suggestions }).catch ((error: any) => {
            console.log("error getting printer site suggestions: ", error);
            return []
        });
    }

}

export default SuggesterService;
