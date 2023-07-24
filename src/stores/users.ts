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

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();


// const locations = [
//   { label: 'TestLancaster', value: 1 },
//   { label: 'Concord NH', value: 2 },
//   { label: 'Neenah, WI', value: 3 }
// ];

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


export async function  searchPrinter(printerId: number, userIdValue: number, userType: string) {
  try {
    // Create a SearchRequestDto object with the printerName and other parameters
    const searchRequest: SearchRequestDto = {
      searchText: "",
      pageNumber: 1,
      pageCount: 30,
      orderBy: "PrinterId",
      orderByAsc: true,
      isActive: true,
      printerId: printerId,
      userId: 0,
      userTypeKey: userType,
    };

    console.log("userSearchReq:" + searchRequest);
    const printerResponse = await UserService.searchPrinter(searchRequest);


    if (printerResponse && printerResponse.data) {
      // Map the API response data to the desired format
      const printers = printerResponse.data.map((printer) => ({
        id: printer.printerId,
        name: printer.printerName,
        //onboardedAt: faker.date.recent(),
        summary: {
          locations: printer.locationCount,
          admins: printer.totalUserCount,
          users: printer.externalUserCount,
          internalUsers: printer.internalUserCount,
          identityProvider: faker.helpers.arrayElement(['google', 'microsoft']),
        },
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
  }),
  actions: {
    async getPrinters(page: number, perPage: number = 500) {
      const total = 301
      let printerId: string ='';
      if (!this.all.length || page === 0) {
        // const all = genPrinters(total)
        const all = await searchPrinter(0,0,'')
        this.all = chunk(all, 500)
      }
      this.printers = {
        page,
        perPage,
        total,
        data: this.all && this.all[page] ? this.all[page] : []
      }

      if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
        printerId = authb2cStore.currentB2CUser.printerId.toString();
      }
         // const all = await searchPrinter(Number(authb2cStore.currentB2CUser.printerId),0,'')
         // this.getPrinterById(authb2cStore.currentB2CUser.printerId.toString())
      
        this.selected = this.printers.data[0]
        if (this.selected)
        {
        this.getPrinterById(this.selected?.id)
        }
        else
        {
          this.getPrinterById(printerId)
        }
        
      
      
    },
    async getPrinterById(id: string, searchValue?: string| "", parentTab?: string| "") {
      const printer = this.printers.data.find((p: any) => p.id === id)

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
      
      if (searchValue !== undefined && searchValue !== null) {
        searchKey = searchValue;
      }

      console.log("getPrinterById");
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
      console.log("printername:" + printerName);
        const locationResult = await fetchLocations(printerName);
        // Ensure the locations are in the required format with 'label' and 'value' properties
        this.options.locations = locationResult.map((location: string, index: string) => ({
          label: location,
          value: location, // You can use a unique identifier here if available from the API.
        }));

        console.log("locations:"+ this.options.locations);
      }
      //todo: we need to get printerId for internal user
      // else {
      //   // If `printerName` is not available, use the default locations
      //   this.options.locations = locations;
      // }
      //const locationsResp = this.options.locations;

       if(userType === 'INT')
       {
        userId =0
       }

       if(userType == 'EXT')
       {
        this.userSearchExtResp = await searchUsers(prtId, userId, 'EXT', searchKey);
       }
       else if(userType == 'INT')
       {
        this.userSearchExtResp = await searchUsers(prtId, userId, 'EXT', searchKey);
       }
       
       this.userSearchIntResp = await searchUsers(prtId, userId, 'INT', searchKey);
       
       console.log("PrinterId:"+ prtId);
       
        this.locationSearchResp = await searchLocation(prtId,0, '');
       
     // this.searchUsers(2);
      const locations = this.locationSearchResp;
      const printerDetails = {
        ...printer,
        locations,
        users: [
          //printer.name
        ...IterateUser(this.userSearchExtResp.data,this.userSearchExtResp.totalRecords)
        //...IterateLocation(this.locationSearchResp.data,this.locationSearchResp.totalRecords)
        // ...genUsers(printer.summary.admins, printer.name, locationsResp, true),
        // ...genUsers(printer.summary.users, printer.name, locationsResp),
        ],
        internalUsers: [
          ...IterateUser(this.userSearchIntResp.data,this.userSearchIntResp.totalRecords),
          //...genUsers(printer.summary.internalUsers, 'sgsco'),
        ],
        identityProvider: {
          type: 'google',
          tenantId: null,
          admin: null,
          email: null
        }
      }
      this.selectPrinter(printerDetails)
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
          isAdmin: false
        }
      }
      console.log("createUser");
      router.push('/users/new')
    },
   async getUser(id: string) {
   // this.user = null;
      console.log("Getid:"+ id);
      //const users = this.selected.users
      const userEditResp = await UserService.getUserDetails(id);
      console.log("Getusers:"+ userEditResp);
      //const user = userEditResp?.find((u: any) => u.id === id)

    if(userEditResp != null)
    {
       this.user ={
        id: userEditResp.id,
        firstName: userEditResp.firstName,
        lastName: userEditResp.lastName,
        email: userEditResp.email,
       location : userEditResp.printerLoc?.[0]?.locationName || "N/A",
       isAdmin: userEditResp.roles?.[0]?.isAdmin || false
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

        const userDto: UserDto = {
          id: userreq.value.id,
          firstName: userreq.value.firstName,
          lastName: userreq.value.lastName,
          displayName: `${userreq.value.firstName} ${userreq.value.lastName}`,
          email: userreq.value.email,
          printerId: printerIdValue,
          roles: null, 
          isAdmin: userreq.value.isAdmin,
          printerLoc: [
            {
              locationName: userreq.value.location,
            },
          ],
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
      console.log('Save provider', printerreq)

        const printerDto: PrinterDto = {
          printerName: printerreq.value.name,
          userData: {
          firstName: printerreq.value.admin,
          lastName: printerreq.value.admin,
          displayName: printerreq.value.admin,
          email: printerreq.value.email
          },
          userIdentityProv: [
            {
              identityProviderId: printerreq.value.provider,
            },
          ]
        };
    console.log("Add Printer Req:" + printerDto);
    await UserService.SavePrinter(printerDto)
      .then((response: any) => {
        console.log('Printer saved:', response);
        this.printers.id = response;
        router.push('/users?role=super');
      })
      .catch((error) => {
        console.error('Error saving printer:', error);
        // Handle error scenario
      });
    },
  },
});


 
