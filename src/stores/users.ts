import { genLocations, genPrinters } from '@/data/mock/printers'
import { genUsers } from '@/data/mock/users'
import { faker } from '@faker-js/faker'
import { defineStore } from 'pinia'
import { chunk } from 'lodash'
import router from '@/router'
import SuggesterService from "@/services/SuggesterService";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";


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
        this.options.locations = locationResult.map((location: string, index: number) => ({
          label: location,
          value: index + 1, // You can use a unique identifier here if available from the API.
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
    saveUser() {
      debugger;
      console.log('Save user', this.user)
      this.user = null
      router.push('/users')
    }
  },
});


 
