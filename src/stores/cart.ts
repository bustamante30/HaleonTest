import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import { useOrdersStore } from './orders'
import { useNotificationsStore } from './notifications'

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartOrders: [] as any[],
    initialCartCount: 0,
  }),
  getters: {
    cartCount: (state) => {
      return state.cartOrders.length || state.initialCartCount || 0
    },
    isOrderInCart: (state) => (orderId: string) => {
      const order = state?.cartOrders?.find((o: any) => o.id === orderId)
      return !!order
    },
  },
  actions: {
    async getCartCount() {
      this.initialCartCount = await ReorderService.getCartCount();
    },
    async getCart() {
      this.cartOrders = await ReorderService.getCart();
      this.decorateCartOrders();
      await this.getCartCount()
    },
    reorderFromCart(id: string) {
      const orderStore = useOrdersStore()
      orderStore.getOrderById(id)
    },
    decorateCartOrders() {
      for (let i = 0; i < this.cartOrders.length; i++) {
        if (!this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = new URL(
            "@/assets/images/no_thumbnail.png",
            import.meta.url
          );
        } else if (this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = decodeURIComponent(
            this.cartOrders[i].thumbNailPath
          );
        }
        ReorderService.decorateColours(this.cartOrders[i].colors);
      }
    },
    async addToCart(order: any) {
      const orderStore = useOrdersStore()
      const draftResult = await ReorderService.submitReorder(order, 1)
      orderStore.successfullReorder = draftResult
      await this.getCart()
      await this.getCartCount()
      return !!draftResult
    },
    async updateToCart(order: any) {
      const orderStore = useOrdersStore()
      const isUpdate = true
      const draftResult = await ReorderService.submitReorder(order, 1, isUpdate)
      orderStore.successfullReorder = draftResult
      await this.getCart()
      await this.getCartCount()
      return !!draftResult
    },
    async discardOrder(id: string) {
      const notificationsStore = useNotificationsStore()
      const result = await ReorderService.discardOrder(id);
      if (!result) {
        notificationsStore.addNotification(`Error`, 'Error discarding the order', { severity: 'error' })
      }
      else {
        notificationsStore.addNotification(`Success`, 'Draft discarded successfully', { severity: 'success' })
        this.getCart()
        await this.getCartCount()
      }
    },
    flattenedColorsArrayDecorator(colors: any) {
      const flattenedColors = toRaw(colors)?.map((color: any) => {
        const plateType = [{
          plateTypeId: color?.plateTypeId,
          plateType: color?.plateTypeDescription,
          plateThicknessId: color?.plateThicknessId,
          plateThickness: color?.plateThicknessDescription,
          sets: color?.sets
        }]
        return {
          clientPlateColourRef: color.clientPlateColourRef,
          colourName: color.colourName,
          colourType: color.colourType,
          commonColourRef: color.commonColourRef,
          custCarrierIdNo: color.custCarrierIdNo,
          custImageIdNo: color.custImageIdNo,
          imageCarrierId: color.imageCarrierId,
          isActive: color.isActive,
          isNew: color.isNew,
          jobTechSpecColourId: color.jobTechSpecColourId,
          originalSets: color.originalSets,
          sequenceNumber: color.sequenceNumber,
          sets: color.sets,
          plateType: [...plateType]
        }
      })
      return flattenedColors
    }
  }
})
