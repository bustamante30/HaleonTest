/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import { useOrdersStore } from "./orders";
import { useNotificationsStore } from "./notifications";

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartOrders: [] as any[],
    initialCartCount: 0,
    loading: {
      cart: false,
      count: false,
      update: false,
      add: false,
      discard: false,
    },
    notificationsStore: useNotificationsStore(),
  }),
  getters: {
    cartCount: (state) => {
      return state.cartOrders.length || state.initialCartCount || 0;
    },
    isOrderInCart: (state) => (orderId: string) => {
      const order = state?.cartOrders?.find((o) => o.id === orderId);
      return !!order;
    },
  },
  actions: {
    async getCartCount() {
      this.loading.count = true;
      const response = await ReorderService.getCartCount();
      if (response.result) {
        this.initialCartCount = response.data;
      } else {
        this.notificationsStore.addNotification(
          `Error`,
          response.ExceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
        return false;
      }
      this.loading.count = false;
    },
    async getCart() {
      this.loading.cart = true;
      const response = await ReorderService.getCart();
      if (response.result) {
        this.cartOrders = response.data;
        this.decorateCartOrders();
      } else {
        this.notificationsStore.addNotification(
          `Error`,
          response.ExceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
        return false;
      }
      this.loading.cart = false;
      return true;
    },
    decorateCartOrders() {
      for (let i = 0; i < this.cartOrders.length; i++) {
        ReorderService.decoratePhotonOrder(this.cartOrders[i]);
      }
    },
    async addToCart(order: any): Promise<boolean> {
      this.loading.add = true;
      const orderStore = useOrdersStore();
      const draftResult = await ReorderService.submitReorder(order, 1);
      if (draftResult.result) {
        orderStore.successfullReorder = draftResult;
        if (draftResult) this.getCart();
      } else {
        this.notificationsStore.addNotification(
          `Error`,
          draftResult.exceptionDetails?.message,
          { severity: "error", life: 5000 },
        );
      }
      this.loading.add = false;
      return draftResult.result || false;
    },
    async updateToCart(order: any) {
      this.loading.update = true;
      const orderStore = useOrdersStore();
      const isUpdate = true;
      const draftResult = await ReorderService.submitReorder(
        order,
        1,
        isUpdate,
      );
      if (draftResult.result) {
        orderStore.successfullReorder = draftResult;
        if (draftResult) this.getCart();
      } else {
        this.notificationsStore.addNotification(
          `Error`,
          draftResult.exceptionDetails?.message,
          { severity: "error", life: 5000 },
        );
      }
      this.loading.update = false;
      return draftResult.result;
    },
    async discardOrder(id: string) {
      this.loading.discard = true;
      const notificationsStore = useNotificationsStore();
      const response = await ReorderService.discardOrder(id);
      if (response.result && response.data) {
        notificationsStore.addNotification(
          `Success`,
          "Draft discarded successfully",
          { severity: "success" },
        );
        this.getCart();
        await this.getCartCount();
      } else {
        this.notificationsStore.addNotification(
          `Error`,
          response.ExceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
      }
      this.loading.discard = false;
    },
    flattenedColorsArrayDecorator(colors: any) {
      const flattenedColors = [] as any[];
      console.log(colors);
      colors?.length &&
        colors?.forEach((color: any) => {
          // eslint-disable-next-line no-unsafe-optional-chaining
          (color?.plateTypes).forEach((plate: any) => {
            flattenedColors.push({
              clientPlateColourRef: color.clientPlateColourRef,
              colourName: color.colourName,
              colourType: color.colourType,
              commonColourRef: color.commonColourRef,
              custCarrierIdNo: color.custCarrierIdNo,
              custImageIdNo: color.custImageIdNo,
              imageCarrierId: color.custImageIdNo
                ? color.custImageIdNo
                : color.custCarrierIdNo
                ? color.custCarrierIdNo
                : color.imageCarrierId,
              serialNumber: plate.serialNumber,
              isActive: true,
              isNew: color.isNew,
              jobTechSpecColourId: color.jobTechSpecColourId,
              newColour: color.newColour,
              originalSets: plate.sets,
              id: plate.id,
              plateTypeId: plate?.plateTypeId,
              plateThicknessId: plate?.plateThicknessId,
              plateThicknessDescription: plate.plateThicknessDescription,
              plateTypeDescription: plate.plateTypeDescription,
              sequenceNumber: color.sequenceNumber,
              sets: plate.sets,
            });
          });
        });
      return flattenedColors;
    },
  },
});
