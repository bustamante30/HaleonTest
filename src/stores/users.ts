import { genLocations, genPrinters } from '@/data/mock/printers'
import { genUsers } from '@/data/mock/users'
import { faker } from '@faker-js/faker'
import { defineStore } from 'pinia'
import { chunk } from 'lodash'
import router from '@/router'
import SuggesterService from "@/services/SuggesterService";
import type { UserDto } from '../models/UserDto';
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import UserService from "@/services/userService";
import type { SearchRequestDto } from  '../models/SearchRequestDto';
import type { UserSearchResponseDto } from  '../models/UserSearchResponseDto';
import type { SearchResponeDto } from  '../models/SearchResponeDto';
import type { LocationSearchResponseDto } from  '../models/LocationSearchResponseDto';
import type { PrinterDto } from '../models/PrinterDto';
import type { UserPrinterLocationDto } from '@/models/UserPrinterLocationDto'

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

export async function fetchLocations(printerName: string) {
  try {
    const locationResult = await SuggesterService.getPrinterSiteList(printerName, "");
    return locationResult;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function  searchUsers(printerId: number, userIdValue: number, userType: string, searchValue: string) {
  try {
    // Create a SearchRequestDto object with the printerName and other parameters

    const searchRequest: SearchRequestDto = {
      searchText: searchValue,
      pageNumber: 1,
      pageCount: 30,
      orderBy: "ModifiedOn",
      orderByAsc: true,
      isActive: true,
      printerId: printerId,
      userId: 0,
      userTypeKey: userType,
    };

    console.log("userSearchReq:" + searchRequest);
    const usersResponse = await UserService.searchUser(searchRequest);

    // Update the 'users' array with the response from the API
    if (usersResponse) {
     return usersResponse;

    } else {
      // Handle error scenario if needed
      console.error('Error searching users:', usersResponse);
    }
  } catch (error) {
    // Handle error scenario if needed
    console.error('Error searching users:', error);
  }
}


function IterateUser(userList: [], count: number) {
  const usersSearchResponseArr = [] as UserSearchResponseDto[]
  for (let i = 0; i < count; i++) {
    usersSearchResponseArr.push(userList[i])
  }
  return usersSearchResponseArr
}

export async function  searchLocation(printerIdValue : number, userIdValue : number, userType : string) {
  try {
    // Create a SearchRequestDto object with the printerName and other parameters

    const searchRequest: SearchRequestDto = {
      searchText: "",
      pageNumber: 1,
      pageCount: 300,
      orderBy: "PrinterId",
      orderByAsc: true,
      isActive: true,
      printerId: printerIdValue,
      userId: 0,
      userTypeKey: userType,
    };

    console.log("searchReq:" + searchRequest);
    const locationResponse = await UserService.searchLocation(searchRequest);

    if (locationResponse) {
      
      return locationResponse.data.map((location) => ({
        id: location.locationId,
        name: location.locationName,
      }));
     

    } else {
      // Handle error scenario if needed
      return null;
    }
  } catch (error) {
    // Handle error scenario if needed
    console.error('Error searching Location:', error);
  }
}

function IterateLocation(LocationList: [], count: number) {
  const locSearchResponseArr = [] as LocationSearchResponseDto[]
  for (let i = 0; i < count; i++) {
    locSearchResponseArr.push(LocationList[i])
  }
  return locSearchResponseArr
}


export async function  searchPrinter(printerId: number, userIdValue: number, userType: string ="", searchPrinterKey: string ="", loginUserType: string="") {
  try {
    let externalprinterCountResponse: any;
    // Create a SearchRequestDto object with the printerName and other parameters
    const searchRequest: SearchRequestDto = {
      searchText: searchPrinterKey,
      pageNumber: 1,
      pageCount: 30,
      orderBy: "PrinterId",
      orderByAsc: true,
      isActive: true,
      printerId: printerId,
      userId: 0,
      userTypeKey: userType,
    };

    const printerResponse = await UserService.searchPrinter(searchRequest);


    // if the login user is external
    if( loginUserType === 'EXT')
    {
     externalprinterCountResponse = await UserService.GetExternalUserCount(String(userIdValue),String(printerId));
    }


    if (printerResponse && printerResponse.data) {
      // Map the API response data to the desired format
      const printers = printerResponse.data.map((printer) => ({
        id: printer.printerId,
        name: printer.printerName,
        //onboardedAt: faker.date.recent(),
        summary: {
          locations: loginUserType === 'EXT'? externalprinterCountResponse !== undefined? externalprinterCountResponse.extLocationCount:0 :printer.locationCount,
          admins: printer.totalUserCount,
          users: loginUserType === 'EXT'? externalprinterCountResponse !== undefined? externalprinterCountResponse.externalUserCount :0 :printer.externalUserCount,
         //users:printer.externalUserCount,
          internalUsers: printer.internalUserCount,
          identityProvider: printer.identityProviderName,
        },
        identityProviderId: printer.identityProviderId,
        identityProviderName: printer.identityProviderName,
        identityTypeId: printer.identityTypeId,
        identityTypeName: printer.identityTypeName
      }));

      // Return the mapped printers array
      return printers;
    } else {
      console.error('Error searching printers:', printerResponse);
      return [];
    }
  } catch (error) {
    console.error('Error searching printers:', error);
    return [];
  }
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    all: [] as any[], // Mock all printers in db
    printers: {
      page: 0,
      perPage: 20,
      data: [] as any[]
    } as any,
    selected: null as any,
    loading: {
      printers: false,
      printer: false
    },
    options: {
      locations: [] as any[],
    },
    user: null as any,
    userSearchExtResp: null as any,
    userSearchIntResp: null as any,
    locationSearchResp: null as any,
    userTypeValue: null as any,
    userRoleValue: null as any,
    identityProviderId: null as any,
    identityProviderName: null as any,
    identityTypeId: null as any,
    identityTypeName: null as any,
  }),
  actions: {
    async getPrinters(page: number, perPage: number = 500, searchUserKey: string ="", searchPrinterKey: string ="", requestPrinterId: any) {
      const total = 500
      let printerId: string ='';
      let userId: any;

      if(authStore.currentUser.email != '')
      {
      if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
        this.userTypeValue =authStore.currentUser.userType;
        userId = authStore.currentUser.userId;
      } 
      }
      
     if(authb2cStore.currentB2CUser.email != '')
      {
      if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
        this.userTypeValue =authb2cStore.currentB2CUser.userType;
        userId = authb2cStore.currentB2CUser.userId;
      }
      if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
        printerId = authb2cStore.currentB2CUser.printerId.toString();
      }
      }

      if(this.userTypeValue === 'INT')
      {
        if (!this.all.length || page === 0) {
          const all = await searchPrinter(0,0,"",searchPrinterKey,this.userTypeValue)
          this.all = chunk(all, 500)
          }
      }
      else if(this.userTypeValue === 'EXT')
      {
        if (!this.all.length || page === 0) {
          const all = await searchPrinter(Number(printerId),userId,"",searchPrinterKey,this.userTypeValue)
          this.all = chunk(all, 500)
          }
      }

    this.printers = {
      page,
      perPage,
      total,
      data: this.all && this.all[page] ? this.all[page] : []
    }
     
         // const all  = await searchPrinter(Number(authb2cStore.currentB2CUser.printerId),0,'')
         // this.getPrinterById(authb2cStore.currentB2CUser.printerId.toString())
      
        this.selected = this.printers.data[0]
      if(this.userTypeValue !== 'EXT')
      {
        if (requestPrinterId === undefined)
        {
        this.getPrinterById(this.selected?.id,searchUserKey)
        }
        else
        {
          this.getPrinterById(requestPrinterId,searchUserKey)
        }
      }
      else
      {
        this.getPrinterById(this.selected?.id,searchUserKey)
      }
      
    },
    async getPrinterById(id: string, searchUserValue: string = "") 
    {
      const printer = this.printers.data.find((p: any) => p.id === id)
    if(printer != undefined)
    {
      let prtId: number = 0;
      let userId: number = 0;
      let userType: string ='';
      let searchKey: string ='';
      let printerName: string ='';

      //validating the user type.
      if(authStore.currentUser.email != '')
      {
      if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
        userType =authStore.currentUser.userType;
      } 
      }
      
     if(authb2cStore.currentB2CUser.email != '')
      {
      if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
        userType =authb2cStore.currentB2CUser.userType;
      }
      }

      if(userType === 'INT' && id === '')
      {
        const firstPrinter = this.printers.data[0];
        id =firstPrinter;
      }

      if( userType == "EXT")
      {
      if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
        prtId = Number(authb2cStore.currentB2CUser.printerId);
      }

      if (authb2cStore.currentB2CUser?.userId !== undefined && authb2cStore.currentB2CUser?.userId !== null) {
        userId = Number(authb2cStore.currentB2CUser.userId);
      }
    }

    if( userType == "INT")
    {
      if(id != undefined || id !="") 
      {
        prtId = Number(id);
      }
    }

    if(printer != undefined)
    {
    this.identityProviderId = printer.identityProviderId;
    this.identityProviderName = printer.identityProviderName;
    this.identityTypeId = printer.identityTypeId;
    this.identityTypeName = printer.identityTypeName;
    }
    
      if (searchUserValue !== undefined && searchUserValue !== null && searchUserValue != "") {
        searchKey = searchUserValue;
      }

      if(userType === 'EXT')
      {
       printerName = authb2cStore.currentB2CUser.printerName;
      }
      else if (userType === 'INT')
      {
        if(printer != null || printer != undefined)
        {
        printerName = printer.name;
        }
      }
      if (printerName) {
        const locationResult = await fetchLocations(printerName);
        // Ensure the locations are in the required format with 'label' and 'value' properties
        this.options.locations = locationResult.map((location: string, index: string) => ({
          label: location,
          value: location, // You can use a unique identifier here if available from the API.
        }));
      }

       if(userType === 'INT')
       {
        userId =0
       }

       if(userType == 'EXT')
       {
        this.userSearchExtResp = await searchUsers(prtId, userId, 'EXT', searchUserValue);
       }
       else if(userType == 'INT')
       {
        this.userSearchExtResp = await searchUsers(prtId, userId, 'EXT', searchUserValue);
       }
       this.userSearchIntResp = await searchUsers(prtId, userId, 'INT', searchUserValue);
       this.locationSearchResp = await searchLocation(prtId,0, '');
       
      const locations = this.locationSearchResp;
      const printerDetails = {
        ...printer,
        locations,
        users: [
          //printer.name
        ...IterateUser(this.userSearchExtResp.data,this.userSearchExtResp.totalRecords)
        ],
        internalUsers: [
          ...IterateUser(this.userSearchIntResp.data,this.userSearchIntResp.totalRecords),
        ],
        identityProvider: {
          type:  this.identityProviderName,
          tenantId: null,
          admin: null,
          email: null
        }
      }
      this.selectPrinter(printerDetails)
    }
    },
    selectPrinter(printer: any) {
      this.selected = { ...printer }
    },
    createUser() {
      this.user= null;
      if (this.selected) {
        this.user = this.user || {
          firstName: null,
          lastName: null,
          email: null,
          isAdmin: false,
          isPrimaryPM: false
        }
      }
      console.log("createUser");
      router.push('/users/new')
    },
   async getUser(id: string) {
      console.log("Getid:"+ id);
      this.user= null;
      //const users = this.selected.users
      const userEditResp = await UserService.getUserDetails(id);
      console.log("Getusers:"+ userEditResp);



    if(userEditResp != null)
    {

      const selectedLocations = userEditResp?.printerLoc?.map((location: any) => location.locationName); // Array of selected location names

    this.options.locations = this.options.locations.map((location: any) => ({
      ...location,
      selected: selectedLocations?.includes(location.value) // Set selected property based on whether the location is in selectedLocations
    }));


       this.user ={
        id: userEditResp.id,
        firstName: userEditResp.firstName,
        lastName: userEditResp.lastName,
        email: userEditResp.email,
       
       //location : userEditResp.printerLoc  || "N/A",
       isAdmin: userEditResp.roles?.[0]?.isAdmin || false,
       isPrimaryPM: userEditResp.isPrimaryPM || false,
       location: selectedLocations 
      };
    

      //const user = userEditResp;
      if (this.user) {
        this.editUser(this.user);
       
      } 
    }
    else {
      console.log("User not found");
    }
    },
    editUser(user: any) {
      console.log("EditUser:" +user);
      if (this.selected && user) {
        this.user = { ...user}
      }
    router.push(`/users/${this.user.id}`)
    },
    async saveUser(userreq : any) {
      console.log('Save user', userreq)
      this.user = null;
     let printerIdValue: number | null = null;
     let userType: string ='';

     if(authStore.currentUser.email != "")
     {
     if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null && authStore.currentUser?.userType != "") {
       userType =authStore.currentUser.userType;
     } 
     }
     
    if(authb2cStore.currentB2CUser.email != "")
     {
     if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null && authb2cStore.currentB2CUser?.userType != "") {
       userType =authb2cStore.currentB2CUser.userType;
     }
     }

  if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null && typeof authb2cStore.currentB2CUser.printerId === 'number' && authb2cStore.currentB2CUser.printerId > 0) 
  {
    printerIdValue = Number(authb2cStore.currentB2CUser.printerId);
  }
  else
  {
    printerIdValue = this.selected.id;
  }

        const printerLoc: UserPrinterLocationDto[] = []
        userreq.value.location.forEach((location:string)=>{
          printerLoc.push({
            locationName : location
          })
        });

        const userDto: UserDto = {
          id: userreq.value.id,
          firstName: userreq.value.firstName,
          lastName: userreq.value.lastName,
          displayName: `${userreq.value.firstName} ${userreq.value.lastName}`,
          email: userreq.value.email,
          printerId: printerIdValue,
          roles: null, 
          isAdmin: userreq.value.isAdmin,
          isPrimaryPM:userreq.value.isPrimaryPM,
          printerLoc
        };
     await UserService.saveUser(userDto)
      .then((response: any) => {
        this.user = null;
        if(userType ==='EXT')
        {
        router.push('/users'); 
        }
        else if (userType === 'INT')
        {
          router.push('/users?role=super');
        }
      })
      .catch((error) => {
        console.error('Error saving user:', error);
        // Handle error scenario
      });

 
    },
   async savePrinter(printerreq : any) {
        const printerDto: PrinterDto = {
          printerName: printerreq.value.name,
          userData: [{
          firstName: printerreq.value.adminFirstName,
          lastName: printerreq.value.adminLastName,
          displayName: printerreq.value.adminFirstName + printerreq.value.adminLastName,
          email: printerreq.value.adminEmail,
          isAdmin: true
          },
          {
            firstName: printerreq.value.primaryPMFirstName,
            lastName: printerreq.value.primaryPMLastName,
            displayName: printerreq.value.primaryPMFirstName + printerreq.value.primaryPMLastName,
            email: printerreq.value.primaryPMEmail,
            isAdmin: false,
            isPrimaryPM: true
            },
        
        ],
            printerIdentityProv: [
            {
                identityProviderId: printerreq.value.provider,
                identityTypeId: printerreq.value.federatedProvider
            },
          ]
        };
    await UserService.SavePrinter(printerDto)
      .then((response: any) => {
        this.printers.id = response;
        router.push('/users?role=super');
      })
      .catch((error) => {
        console.error('Error saving printer:', error);
        // Handle error scenario
      });
    },
    async deleteUser(user: any) {
      console.log("DeleteUser:"+ user);
      try {
        await UserService.DeleteUser(user);
      } catch (error) {
        console.error("Error deleting user:", error);
        // Handle error scenario if needed
      }
    },
    async resendInvitation(user: any) {
      try {
        await UserService.ResendInvitation(user);
        console.log("Invitation resent successfully.");
      } catch (error) {
        console.error("Error resending invitation:", error);
        // Handle error scenario if needed
      }
    },
  },
});


 
