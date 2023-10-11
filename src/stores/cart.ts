import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import { useOrdersStore } from './orders'
import { useNotificationsStore } from './notifications'
import { faker } from '@faker-js/faker';

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartOrders: [] as any[],
    initialCartCount: 0,
    loading: {
      cart: false,
      count: false,
      update: false,
      add: false,
      discard: false
    },    
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
      this.loading.count = true
      this.initialCartCount = await ReorderService.getCartCount();
      this.loading.count = false
    },
    async getCart() {
      this.loading.cart = true
      this.cartOrders = await ReorderService.getCart();
      this.decorateCartOrders();
      this.loading.cart = false
    },
    decorateCartOrders() {
      for (let i = 0; i < this.cartOrders.length; i++) {
        console.log(this.cartOrders[i].colors)
        ReorderService.decorateColours(this.cartOrders[i].colors);
        //transform cart colors to the structure used in the ui
        this.cartOrders[i].editionColors = JSON.parse(JSON.stringify(this.cartOrders[i].colors)) 
        //remove duplicate colors for first page 
        const distinctColors = this.cartOrders[i].colors.filter(
          (thing, i, arr) => {
            return arr.indexOf(arr.find(t => t.sequenceNumber === thing.sequenceNumber)) === i;
          }
        );
        this.cartOrders[i].colors = distinctColors;
        //make editable the colors:
        
        this.cartOrders[i].editionColors.forEach(color => {
          ReorderService.getLen(this.cartOrders[i].originalOrderId,color.sequenceNumber).
          then(res=>{
            for(let i=0;i<res.length;i++){
              if(res.lenPath == color.lenPath){
                color.lenData = res[i].lenData
                color.checkboxId = faker.datatype.uuid()
                if(color.plates.length==0)
                {
                  color.plateType = [
                    {
                      checkboxId: faker.datatype.uuid(), 
                      plateTypeId: null, 
                      plateTypeDescription: {
                        isActive: true,
                        label: null,
                        value: null,
                      },
                      sets:0
                    }
                  ]
                }
                else{
                  const editionPlates: any[] = []
                  color.plateType = editionPlates 
                  color.plates.forEach(plate =>{
                    let editionPlate = JSON.parse(JSON.stringify(plate)) 
                    editionPlate.checkboxId = faker.datatype.uuid()
                    editionPlate.plateTypeDescription = {
                      isActive: true,
                      label: plate.plateTypeDescription,
                      value: plate.plateTypeId,
                    }
                    color.plateType.push(editionPlate)
                  })
                  console.log(color.plateType)
                }
                break
              }
            }
          })
        });
        this.cartOrders[i].thumbNailPath = new URL(
          "@/assets/images/no_thumbnail.png",
          import.meta.url
        );
        ReorderService.getThumbnail(this.cartOrders[i].originalOrderId)
          .then((response: string | boolean) => {
            if(response) this.cartOrders[i].thumbNailPath = response;
          });
        
        //this.cartOrders[i].flattenedColors = this.flattenedColorsArrayDecorator(this.cartOrders[i].colors)
      }
    },
    async addToCart(order: any) {
      this.loading.add = true
      const orderStore = useOrdersStore()
      const draftResult = await ReorderService.submitReorder(order, 1)
      orderStore.successfullReorder = draftResult
      if (draftResult) this.getCart()
      this.loading.add = false
      return !!draftResult
    },
    async updateToCart(order: any) {
      this.loading.update = true
      const orderStore = useOrdersStore()
      const isUpdate = true
      const draftResult = await ReorderService.submitReorder(order, 1, isUpdate)
      orderStore.successfullReorder = draftResult
      if (draftResult) this.getCart()
      this.loading.update = false
      return !!draftResult
    },
    async discardOrder(id: string) {
      this.loading.discard = true
      const notificationsStore = useNotificationsStore()
      const result = await ReorderService.discardOrder(id);
      if (!result) {
        notificationsStore.addNotification(`Error`, 'Error discarding the order', { severity: 'error' })
        this.loading.discard = false
      }
      else {
        notificationsStore.addNotification(`Success`, 'Draft discarded successfully', { severity: 'success' })
        this.getCart()
        await this.getCartCount()
        this.loading.discard = false
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
