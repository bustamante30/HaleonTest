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

export async function  searchUsers(printerId: number, userIdValue: number, userType: string) {
  try {
    // Create a SearchRequestDto object with the printerName and other parameters

    const searchRequest: SearchRequestDto = {
      searchText: "",
      pageNumber: 1,
      pageCount: 30,
      orderBy: "ModifiedOn",
      orderByAsc: true,
      isActive: true,
      printerId: printerId,
      userId: userIdValue,
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
      pageCount: 30,
      orderBy: "PrinterId",
      orderByAsc: true,
      isActive: true,
      printerId: printerIdValue,
      userId: userIdValue,
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
    locationSearchResp: null as any
  }),
  actions: {
    async getPrinters(page: number, perPage: number = 20) {
      const total = 301
      if (!this.all.length) {
        const all = genPrinters(total)
        this.all = chunk(all, 20)
      }
      console.log("getPrinters");
      this.printers = {
        page,
        perPage,
        total,
        data: this.all && this.all[page] ? this.all[page] : []
      }
      this.selected = this.printers.data[0]
      if (this.selected) this.getPrinterById(this.selected?.id)
    },
    async getPrinterById(id: string) {
      debugger;
      const printer = this.printers.data.find((p: any) => p.id === id)

      let prtId: number = 0;
      let userId: number = 0;
      let userType: string ='';

      if (authStore.currentUser?.printerId !== undefined && authStore.currentUser?.printerId !== null) {
        prtId = Number(authStore.currentUser.printerId);
      } else if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
        prtId = Number(authb2cStore.currentB2CUser.printerId);
      }

      if (authStore.currentUser?.userId !== undefined && authStore.currentUser?.userId !== null) {
        userId = Number(authStore.currentUser.userId);
      } else if (authb2cStore.currentB2CUser?.userId !== undefined && authb2cStore.currentB2CUser?.userId !== null) {
        userId = Number(authb2cStore.currentB2CUser.userId);
      }

      if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
        userType =authStore.currentUser.userType;
      } else if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
        userType =authb2cStore.currentB2CUser.userType;
      }


      // const locations = genLocations(printer.summary.locations)
      console.log("getPrinterById");
      const printerName = authStore.currentUser.printerName || authb2cStore.currentB2CUser.printerName;
  
      if (printerName) {

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
       if(userType === 'EXT')
       {
       this.userSearchExtResp = await searchUsers(prtId, userId, 'EXT');
       }
       else
       {
        this.userSearchExtResp = await searchUsers(prtId, userId, '');
       }

       this.userSearchIntResp = await searchUsers(prtId, userId, 'INT');
       
       if(userType === 'EXT')
       {
       this.locationSearchResp = await searchLocation(prtId,userId, userType);
       }
       else
       {
        this.locationSearchResp = await searchLocation(prtId,userId, '');
       }
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
      debugger;
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
      console.log("Getid:"+ id);
      //const users = this.selected.users
      debugger;
      const userEditResp = await UserService.getUserDetails(id);
      console.log("Getusers:"+ userEditResp);
      const user = userEditResp?.find((u: any) => u.id === id)
      if (user) this.editUser(user)
    },
    editUser(user: any) {
      debugger;
      console.log("EditUser:" +user);
      if (this.selected && user) {
        this.user = { ...user}
      }
    router.push(`/users/${user.id}`)
    },
    saveUser(userreq : any) {
      debugger;
      console.log('Save user', userreq)

     let printerIdValue: number | null = null;

  if (authStore.currentUser?.printerId !== undefined && authStore.currentUser?.printerId !== null) {
    printerIdValue = Number(authStore.currentUser.printerId);
  } else if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
    printerIdValue = Number(authb2cStore.currentB2CUser.printerId);
  }
        const userDto: UserDto = {
          firstName: userreq.value.firstName,
          lastName: userreq.value.lastName,
          displayName: `${userreq.value.firstName} ${userreq.value.lastName}`,
          email: userreq.value.email,
          printerId: printerIdValue,
          userRoles: null, 
          isAdmin: userreq.value.isAdmin,
          PrinterLoc: [
            {
              locationName: userreq.value.location,
            },
          ],
        };
    console.log("StoreuserReq:" + userDto);
     UserService.saveUser(userDto)
      .then((response: any) => {
        console.log('User saved:', response);
        this.user = null;
        router.push('/users'); // Navigate to the users page after saving
      })
      .catch((error) => {
        console.error('Error saving user:', error);
        // Handle error scenario
      });
    }
  },
});


 
