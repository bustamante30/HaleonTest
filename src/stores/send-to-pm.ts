
import { defineStore } from 'pinia'
import { useNotificationsStore } from './notifications'
import SuggesterService from "@/services/SuggesterService";
import SendToPMService from "@/services/SendToPmService";
import type { SearchRequestDto,SearchRequestSendToPmDto } from  '../models/SearchRequestDto';
import UserService from "@/services/userService";

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export const useSendToPmStore = defineStore('sendToPmStore', {
  state: () => ({
    showForm: false,
    newOrder: null as any,
    loading: false,
    options: {
      locations: [] as any[],
    },
    imageCarrierCodeTypes: [] as any[],
    imageCarrierPackTypes: [] as any[],
    imageCarrierPlateTypes: [] as any[]

  }),
  getters: {
  },
  actions: {
    initNewOrder() {
      this.newOrder = {
        printerName: null,
        brand: null,
        description: null,
        packType: null,
        purchaseOrder: null,
        itemCode: null,
        plateId: null,
        carrierCode: {
          type: null,
          code: null,
        },
        jobNumber: null,
        comments: null,
        locationName: null,
        colors:[] as any[],
        uploadedFiles: [] as any[],
        pmUsersForPrinter: [] as any[]
      }
    },
    async sendToPm(form : any) {
      this.loading = true
      await timeout(2000)
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification(`Order Sent`, 'Your order is successfully sent to a project manager', { severity: 'success' })
      this.newOrder = null
      this.loading = false
    },
    async getPrinterLocations(printerName: string){
     this.options.locations= await SuggesterService.getPrinterSiteList(printerName, "");
    },
    async submitorder(order:any){
      order.colors = this.newOrder.colors;
      order.files = this.newOrder.uploadedFiles;
      order.pmUsersForPrinter = this.newOrder.pmUsersForPrinter;
      await SendToPMService.submitExitOrder(order)

      this.newOrder = null
    },
    async updateColors(colors:any[]){
      this.newOrder.colors = [...colors]

    },
    async uploadData(files: []) {
      this.newOrder.uploadedFiles = [...files]
    },
    async getCodeTypes(){
      this.imageCarrierCodeTypes= await SendToPMService.getCodeTypeList();
     },

    async getPackTypes(){
      this.imageCarrierPackTypes= await SendToPMService.getPackTypeList();
     },
     async getPlateTypes(){
      this.imageCarrierPlateTypes= await SendToPMService.getPlateType();
     },

     async getPmusersForLocation(printerId: number,printerLocationName:string){
      const searchRequest: SearchRequestSendToPmDto = {
        searchText: "",
        pageNumber: 1,
        pageCount: 100,
        orderBy: "ModifiedOn",
        orderByAsc: true,
        isActive: true,
        printerId: printerId,
        userId: 0,
        userTypeKey: "INT",
        roleKey:"PMUser"
      };
      console.log("userSearchReq:" + searchRequest);
      const usersResponse = await UserService.searchUser(searchRequest);
      if (usersResponse) {
        const normalizedPrinterLocationName = printerLocationName.replace(/\s/g, ''); // Remove spaces
        this.newOrder.pmUsersForPrinter = usersResponse.data.filter(user => {
          const normalizedLocationNames = user.locationName.replace(/\s/g, ''); // Remove spaces from user's locationName
          return normalizedLocationNames.split(",").includes(normalizedPrinterLocationName);
        });
      } else {
        console.error('Error searching users:', usersResponse);
        this.newOrder.pmUsersForPrinter = []; // Return an empty array
      }
    }

  }
})