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
         } 
        //else if (this.cartOrders[i].thumbNailPath) {
        //   this.cartOrders[i].thumbNailPath = decodeURIComponent(
        //     this.cartOrders[i].thumbNailPath
        //   );
        // }
        else if (this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = 
            this.cartOrders[i].thumbNailPath;
        }
        ReorderService.decorateColours(this.cartOrders[i].colors);
        this.cartOrders[i].flattenedColors = this.flattenedColorsArrayDecorator(this.cartOrders[i].colors)
      }
    },
    async addToCart(order: any) {
      const orderStore = useOrdersStore()
      orderStore.loading.cart = true
      const draftResult = await ReorderService.submitReorder(order, 1)
      orderStore.successfullReorder = draftResult
      orderStore.loading.cart = false
      if(draftResult)
        this.getCart()
      return !!draftResult
    },
    async updateToCart(order: any) {
      const orderStore = useOrdersStore()
      orderStore.loading.cart = true
      const isUpdate = true
      const draftResult = await ReorderService.submitReorder(order, 1, isUpdate)
      orderStore.successfullReorder = draftResult
      orderStore.loading.cart = false
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
      const flattenedColors = [] as any[]
      console.log(colors)
      colors?.length && colors?.forEach((color: any) => {
        (color?.plateTypes).forEach((plate: any) => {
          flattenedColors.push({
            clientPlateColourRef: color.clientPlateColourRef,
            colourName: color.colourName,
            colourType: color.colourType,
            commonColourRef: color.commonColourRef,
            custCarrierIdNo: color.custCarrierIdNo,
            custImageIdNo: color.custImageIdNo,
            imageCarrierId: color.custImageIdNo?color.custImageIdNo:(color.custCarrierIdNo?color.custCarrierIdNo:color.imageCarrierId),
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
            sets: plate.sets
          })
        })
      })
      return flattenedColors
    }
  }
})
