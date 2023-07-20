import type { UserClaimDto } from '../models/UserClaimDto';
import ApiService  from '../services/apiService';

const baseUrl = 'https://localhost:7026/';

const httpService = new ApiService(baseUrl)

class UserService {

    // public static getV1User() {
    //     return httpService.get<UserDto>("v1/user")
    // }

    public static getUserClaimInfo() {
        return httpService.get<UserClaimDto>('v1/user/RetrieveUserBasicinfo').then((response: UserClaimDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting reorders: ", error);
            return null;
        });
    }

}

export default UserService;
