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
      const order = state.cartOrders.find((o: any) => o.id === orderId) 
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
      // console.log(this.cartOrders);
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
      try {
        const orderStore = useOrdersStore()
        const colors = orderStore.flattenedColors()
        const isOrderInCart = this.isOrderInCart(order.id)
        if (isOrderInCart) {
          orderStore.selectedOrder.statusId = 1
          let draftResult = await ReorderService.updateDraft(order) 
          return true
        } else {
          const result = await ReorderService.submitReorder(order, 1)
          this.getCart()
          return true
        }
      } catch(error) {
        console.error(error)
        return false 
      }
    },  
    async discardOrder(id: string) {
      // console.log("order to be discarded" + id);
      const notificationsStore = useNotificationsStore()
      const result = await ReorderService.discardOrder(id);
      if (!result) {
        notificationsStore.addNotification(`Error`, 'Error discarding the order', { severity: 'error' })
      }
      else {
        notificationsStore.addNotification(`Success`, 'Draft discarded successfully', { severity: 'success' })
        this.getCart()
      }
    },
    flattenedColorsArrayDecorator(colors: any) {
      const flattenedColors = toRaw(colors)?.map((color: any) => {
        const plateTypes = [{
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
          plateTypes: [...plateTypes]
        }
      })
      return flattenedColors
    }     
  }
})
