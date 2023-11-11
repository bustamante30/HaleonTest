/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { useNotificationsStore } from "./notifications";
import SendToPMService from "@/services/SendToPmService";
import * as Constants from "@/services/Constants";

export const useSendToPmStore = defineStore("sendToPmStore", {
  state: () => ({
    showForm: false,
    newOrder: null as any,
    loading: false,
    imageCarrierCodeTypes: [] as any[],
    imageCarrierPackTypes: [] as any[],
    imageCarrierPlateTypes: [] as any[],
    externalPrinterName: "" as string,
    isValidated: false,
  }),
  getters: {},
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
        colors: [] as any[],
        uploadedFiles: [] as any[],
        pmUsersForPrinter: [] as any[],
      };
    },
    clearForm() {
      this.newOrder = null;
      this.loading = false;
    },
    async submitorder(order: any) {
      this.loading = true;
      order.colors = this.newOrder.colors;
      order.files = this.newOrder.uploadedFiles;
      order.pmUsersForPrinter = this.newOrder.pmUsersForPrinter;
      const sendToPmResponse = await SendToPMService.submitExitOrder(order);
      if (sendToPmResponse) {
        this.clearForm();
        return true;
      } else {
        return false;
      }
    },
    async updateColors(colors: any[]) {
      this.newOrder.colors = [...colors];
    },
    async uploadData(files: []) {
      this.newOrder.uploadedFiles = [...files];
    },
    hasDuplicates(colors) {
      const duplicates = [] as any[];
      colors.forEach((color1: any, index1) => {
        colors.forEach((color2: any, index2) => {
          if (
            color1.name === color2.name &&
            color1.plateType === color2.plateType &&
            index1 > index2
          ) {
            duplicates.push(color1.name);
          }
        });
      });
      return duplicates;
    },
    validateColors(colors) {
      let isValid = true;
      colors.forEach((color: any) => {
        if (!(color.name && color.plateType && color.quantity)) isValid = false;
      });
      return isValid;
    },
    validate(order: any, uploads: any) {
      const notificationsStore = useNotificationsStore();
      const errorMessage = [] as any[];
      const hasColors = order.colors && order.colors.length;
      const hasValidColors = this.validateColors(order.colors);
      const hasDuplicate = this.hasDuplicates(order.colors);
      const hasUploadData = uploads && uploads.length > 0;
      const hasExpectedDate = order.expectedDate;
      const hasItemCodeorDescriptionorPlateType =
        order.itemCode || order.description || order.plateId;
      const hasFormFields = hasItemCodeorDescriptionorPlateType || hasColors;
      if (!hasExpectedDate) {
        errorMessage.push(Constants.DELIVERY_TIME);
      }
      if (!hasUploadData && !hasFormFields) {
        errorMessage.push(
          "<p>Enter either item code or product description or plate ID or </p>" +
            "<p>Drag & Drop Document(s)</p>",
        );
        if (errorMessage.length > 0)
          notificationsStore.addNotification(
            Constants.REQUIRED_MSG,
            errorMessage.join(""),
            {
              severity: "warn",
              group: "multiple",
              position: "top-right",
              life: null,
            },
          );
        return errorMessage?.length <= 0;
      } else if (!hasUploadData && hasFormFields) {
        if (!hasItemCodeorDescriptionorPlateType) {
          errorMessage.push(Constants.EITHER_ERROR);
        }
        if (!hasColors) {
          errorMessage.push(Constants.ATLEAST_ONE_COLOR);
        }
        if (!hasValidColors) {
          errorMessage.push(Constants.VALID_COLOR);
        }
        if (hasDuplicate && hasDuplicate.length) {
          errorMessage.push(
            `<p>You have selected the same plate type for ${hasDuplicate.join(
              ", ",
            )}</p>`,
          );
        }
      }
      if (errorMessage.length > 0)
        notificationsStore.addNotification(
          Constants.REQUIRED_MSG,
          errorMessage.join(""),
          {
            severity: "warn",
            group: "multiple",
            position: "top-right",
            life: null,
          },
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
  },
});
