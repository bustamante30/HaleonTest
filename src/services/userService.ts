import type { UserDto } from '../models/UserDto';
import ApiService  from './apiService';

//const baseUrl = "https://photon-dev-eastus-clientingestion.azurewebsites.net/"
const baseUrl ="http://localhost:5208/"
const httpService = new ApiService(baseUrl)

class UserService {

    public static getV1User() {
        return httpService.get<UserDto>("v1/user")
    }

}

export default UserService;
