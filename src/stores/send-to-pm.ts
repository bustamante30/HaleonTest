import { defineStore } from 'pinia'
import { useNotificationsStore } from './notifications'
import SuggesterService from "@/services/SuggesterService";
import SendToPMService from "@/services/SendToPmService";
import type { SearchRequestSendToPmDto } from '../models/SearchRequestDto';
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
        expectedDate: null,
        isUrgent: null,
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
        colors: [] as any[],
        uploadedFiles: [] as any[],
        pmUsersForPrinter: [] as any[]
      }
    },
    async sendToPm(form: any) {
      this.loading = true
      await timeout(2000)
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification(`Order Sent`, 'Your order is successfully sent to a project manager', { severity: 'success' })
      this.newOrder = null
      this.loading = false
    },
    async getPrinterLocations(printerName: string) {
      this.options.locations = await SuggesterService.getPrinterSiteList(printerName, "");
    },
    async submitorder(order: any) {
      order.colors = this.newOrder.colors;
      order.files = this.newOrder.uploadedFiles;
      order.pmUsersForPrinter = this.newOrder.pmUsersForPrinter;
      await SendToPMService.submitExitOrder(order)

      this.newOrder = null
    },
    async updateColors(colors: any[]) {
      this.newOrder.colors = [...colors]

    },
    async uploadData(files: []) {
      this.newOrder.uploadedFiles = [...files];
    },
    hasDuplicates(colors) {
      const duplicates = [] as any[]
      colors.forEach((color1: any, index1) => {
        colors.forEach((color2: any, index2) => {
          if (color1.name === color2.name && color1.plateType === color2.plateType && index1 > index2) {
            duplicates.push(color1.name);
          }
        })
      })
      return duplicates
    },
    validateColors(colors) {
      let isValid = true
      colors.forEach((color: any, index) => {
        if (!(color.name && color.plateType && color.quantity))
          isValid = false
      })
      return isValid
    },
    validate(order: any, uploads: any) {
      const notificationsStore = useNotificationsStore();
      const errorMessage = [] as any[];
      const isPrinterAndLocationEmpty =
        order.locationName == null || order.printerName == null;
      // Check if any other field has a value
      const hasAnyOtherFieldValue =
        order.brand ||
        order.description ||
        order.packType ||
        order.purchaseOrder ||
        order.itemCode ||
        order.plateId ||
        (order.carrierCode && order.carrierCode.type) ||
        order.jobNumber ||
        order.comments ||
        (uploads && uploads.length > 0);
      // check isUrgent order and check mandatory fileds
      if (order.isUrgent) {
        // color validations
        const hasColors = order.colors && order.colors.length;
        const hasValidColors = this.validateColors(order.colors);
        const hasDuplicate = this.hasDuplicates(order.colors);
        // const hasQuantityLessThanOrEqualTo10 = order.colors.some(
        //   (obj) => obj.quantity <= 10
        // );
        // other validations
        const hasExpectedDate = order.expectedDate;
        const hasItemCodeorDescriptionorPlateType =
          order.itemCode || order.description || order.plateId;
        if (!hasExpectedDate) {
          errorMessage.push("<p>Delivery Date and Time.</p>");
        }
        if (!hasItemCodeorDescriptionorPlateType) {
          errorMessage.push(
            "<p>Item Code or Description or Plate ID.</p>"
          );
        }
        if (!hasColors) {
          errorMessage.push("<p>At least 1 Colour and PlateType is required.</p>");
        }
        if (!hasValidColors) {
          errorMessage.push("<p>Colour Name, PlateType & Quantity.</p>");
        }
        if (hasDuplicate && hasDuplicate.length) {
          errorMessage.push(
            `<p>You have selected the same plate type for ${hasDuplicate.join(', ')}</p>`
          );
        }
        // if (!hasQuantityLessThanOrEqualTo10) {
        //   errorMessage.push("<p>Quantity must be greater than 10.</p>");
        // }
      } else {
        if (isPrinterAndLocationEmpty) {
          errorMessage.push("Location is Mandatory.");
        }
        if (!hasAnyOtherFieldValue) {
          errorMessage.push(
            "At least one additional field other than Location is required"
          );
        }
      }
      if(errorMessage.length > 0)
        notificationsStore.addNotification(
          "Please fill the required fields : ",
          errorMessage.join("\n"),
          { severity: "warn", group: "multiple", life: null, position: "top-right", }
        );
      return errorMessage?.length <= 0;
    },
    async getCodeTypes() {
      this.imageCarrierCodeTypes = await SendToPMService.getCodeTypeList();
    },

    async getPackTypes() {
      this.imageCarrierPackTypes = await SendToPMService.getPackTypeList();
    },
    async getPlateTypes() {
      this.imageCarrierPlateTypes = await SendToPMService.getPlateType();
    },

    async getPmusersForLocation(printerId: number, printerLocationName: string) {
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
        roleKey: "PMUser"
      };
      console.log("userSearchReq:" + searchRequest);
      const usersResponse = await UserService.searchUser(searchRequest);
      if (usersResponse) {
        const normalizedPrinterLocationName = printerLocationName.replace(/\s/g, ''); // Remove spaces
        this.newOrder.pmUsersForPrinter = usersResponse.data.filter(user => {
          const normalizedLocationNames = user?.locationName?.replace(/\s/g, ''); // Remove spaces from user's locationName
          return normalizedLocationNames?.split(",").includes(normalizedPrinterLocationName);
        });
      } else {
        console.error('Error searching users:', usersResponse);
        this.newOrder.pmUsersForPrinter = []; // Return an empty array
      }
    }

  }
})