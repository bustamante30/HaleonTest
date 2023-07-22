import type { UserClaimDto } from '../models/UserClaimDto';
import type { UserDto } from '../models/UserDto';
import type { SearchRequestDto } from '../models/SearchRequestDto';
import type { UserSearchResponseDto } from '../models/UserSearchResponseDto';
import type { SearchResponeDto} from  '../models/SearchResponeDto';
import type { PrinterDto} from  '../models/PrinterDto';
import ApiService  from '../services/apiService';

const baseUrl = 'https://localhost:7026/';

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
        debugger;
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
    debugger;
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
    return httpService.get<any>('v1/user/Retrieve?userId=' + userId).then((response: any) => {
        return response
    }).catch((error: any) => {
        console.log("error getting User Details: ", error);
        return null;
    });
}

public static addPrinter(printerData: PrinterDto) {
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

}

export default UserService;
