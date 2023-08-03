import type { UserClaimDto } from '../models/UserClaimDto';
import type { UserDto } from '../models/UserDto';
import type { SearchRequestDto } from '../models/SearchRequestDto';
import type { UserSearchResponseDto } from '../models/UserSearchResponseDto';
import type { SearchResponeDto} from  '../models/SearchResponeDto';
import type { PrinterDto} from  '../models/PrinterDto';
import ApiService  from '../services/apiService';

const baseUrl = import.meta.env.VITE_USER_API_BASE_URL ??'https://localhost:7026/';
//import.meta.env.VITE_USER_API_BASE_URL ??

const httpService = new ApiService(baseUrl)


class UserService {

    public static getUserClaimInfo() {
        return httpService.get<UserClaimDto>('v1/user/RetrieveUserBasicinfo').then((response: UserClaimDto) => {
            return response
        }).catch((error: any) => {
            console.log("error getting reorders: ", error);
            return null;
        });
    }

     public static saveUser(user: UserDto) {
        console.log("StoreuserReq:" + user);
    return httpService.post<UserDto>('v1/user', user)
      .then((response: UserDto) => {
        return response;
      })
      .catch((error: any) => {
        console.log('Error saving user:', error);
        return null;
      });
  }

  public static searchUser(searchRequest: SearchRequestDto) {
    return httpService.post<SearchResponeDto>('v1/user/search', searchRequest)
      .then((response: SearchResponeDto) => {
        return response; 
      })
      .catch((error: any) => {
        console.log('Error searching user:', error);
        return null;
      });
  }

  public static searchLocation(searchRequest: SearchRequestDto) {
    console.log("locationSearch:" + searchRequest);
    return httpService.post<SearchResponeDto>('v1/printer/locationsearch', searchRequest)
      .then((response: SearchResponeDto) => {
        return response; 
      })
      .catch((error: any) => {
        console.log('Error searching Location:', error);
        return null;
      });
  }


  public static searchPrinter(searchRequest: SearchRequestDto) {
    return httpService.post<SearchResponeDto>('v1/printer/printersearch', searchRequest)
      .then((response: SearchResponeDto) => {
        return response; 
      })
      .catch((error: any) => {
        console.log('Error searching Printer:', error);
        return null;
      });
  }

  public static getUserDetails(userId: string) {
    return httpService.get<UserDto>('v1/user/Retrieve?userId=' + userId).then((response: UserDto) => {
        return response
    }).catch((error: any) => {
        console.log("error getting User Details: ", error);
        return null;
    });
}

public static SavePrinter(printerData: PrinterDto) {
  return httpService
    .post<PrinterDto>('v1/printer', printerData)
    .then((response: PrinterDto) => {
      return response;
    })
    .catch((error: any) => {
      console.log('Error adding printer:', error);
      return null;
    });
}

public static DeleteUser(userId: string) {
  const params = { userId, isActive: false };
  return httpService
    .delete<boolean>('v1/user/Delete?userId='+ userId +'&isActive=false')
    .then((response: boolean) => {
      return response;
    })
    .catch((error: any) => {
      console.log('Error deleting user:', error);
      return null;
    });
}

public static ResendInvitation(userId: string) {
  const params = { userId };
  return httpService
    .post<boolean>('v1/user/ResendInvitation?userId='+ userId)
    .then((response: boolean) => {
    return response;
    })
    .catch((error: any) => {
      console.log('Error resending invitation:', error);
    });
}


}

export default UserService;
