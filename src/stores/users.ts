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
    user: null as any
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
      // const locations = genLocations(printer.summary.locations)
      console.log("getPrinterById");
      const printerName = authStore.currentUser.printerName || authb2cStore.currentB2CUser.printerName;
    
      console.log("printername:"+ authStore.currentUser.printerName );
      console.log("B2Cprintername:"+ authb2cStore.currentB2CUser.printerName );
      if (printerName) {

        const locationResult = await fetchLocations(printerName);
        // Ensure the locations are in the required format with 'label' and 'value' properties
        this.options.locations = locationResult.map((location: string, index: string) => ({
          label: location,
          value: location, // You can use a unique identifier here if available from the API.
        }));

        console.log("locations:"+ this.options.locations);
      }
      // else {
      //   // If `printerName` is not available, use the default locations
      //   this.options.locations = locations;
      // }

      const locationsResp = this.options.locations;

      //const locations = genLocations()
      const printerDetails = {
        ...printer,
        locationsResp,
        users: [
          ...genUsers(printer.summary.admins, printer.name, locationsResp, true),
          ...genUsers(printer.summary.users, printer.name, locationsResp),
        ],
        internalUsers: [
          ...genUsers(printer.summary.internalUsers, 'sgsco'),
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
    getUser(id: string) {
      const users = this.selected.users
      const user = users?.find((u: any) => u.id === id)
      if (user) this.editUser(user)
    },
    editUser(user: any) {
      console.log(user)
      if (this.selected && user) {
        this.user = { ...user}
      }
      // router.push(`/users/${user.id}`)
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
          printerId: printerIdValue, // Replace with the appropriate printerId value
          userRoles: null, // Replace with the appropriate user roles if needed
          isAdmin: userreq.value.isAdmin,
          PrinterLoc: [
            {
              locationName: userreq.value.location, // Replace with the appropriate location value
            },
          ],
        };
    console.log("StoreuserReq:" + userDto);
      UserService.saveUser(userDto)
      .then((response: any) => {
        console.log('User saved:', response);
        // If you need to update the state after saving the user, do it here
        // For example, you can reset the user object to null after successful save:

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


 
