/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { useNotificationsStore } from "./notifications";
import SendToPMService from "@/services/SendToPmService";

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
      if (order.isUrgent) {
        const hasColors = order.colors && order.colors.length;
        const hasValidColors = this.validateColors(order.colors);
        const hasDuplicate = this.hasDuplicates(order.colors);
        const hasUploadData = uploads && uploads.length > 0;
        const hasExpectedDate = order.expectedDate;
        const hasItemCodeorDescriptionorPlateType =
          order.itemCode || order.description || order.plateId;
        if (!hasUploadData) {
          errorMessage.push(
            "<p>Please fill the following required fields or Drag & </p>" +
              "<p/>Drop Document(s)</p>",
          );
        }
        if (!hasExpectedDate) {
          errorMessage.push(
            "<p>Please select a delivery date and time to proceed.</p>",
          );
        }
        if (!hasItemCodeorDescriptionorPlateType) {
          errorMessage.push("<p>Item Code or Description or Plate ID.</p>");
        }
        if (!hasColors) {
          errorMessage.push(
            "<p>At least 1 Colour and PlateType is required.</p>",
          );
        }
        if (!hasValidColors) {
          errorMessage.push("<p>Colour Name, PlateType & Quantity.</p>");
        }
        if (hasDuplicate && hasDuplicate.length) {
          errorMessage.push(
            `<p>You have selected the same plate type for ${hasDuplicate.join(
              ", ",
            )}</p>`,
          );
        }
      } else {
        if (!hasAnyOtherFieldValue) {
          errorMessage.push("At least one field is required");
        }
      }
      if (errorMessage.length > 0)
        notificationsStore.addNotification(
          "Please fill the required fields : ",
          errorMessage.join(""),
          {
            severity: "warn",
            group: "multiple",
            life: null,
            position: "top-right",
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
