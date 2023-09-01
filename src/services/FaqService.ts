import ApiService from '../services/apiService';

const baseUrl =  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5208/';
const httpService = new ApiService(baseUrl);

export class FaqService {
    public static getFaq() {
        return httpService
        .get('v1/Faq')
        .then((response: any) => {
            console.log('Get Successfully');
            return response;
        })
        .catch((error: any) => {
            console.log('Error submitting files:', error);
            return false;
        });
    }

}
