import type { UserDto } from '../models/UserDto';
import ApiService  from './apiService';

const baseUrl =import.meta.env.API_BASE_URL?? 'http://localhost:5208/';
const httpService = new ApiService(baseUrl)

class UserService {

    public static getV1User() {
        return httpService.get<UserDto>("v1/user")
    }

}

export default UserService;
