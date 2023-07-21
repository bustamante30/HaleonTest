import ordersData from '@/data/mock/orders';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';
import ReorderService from "@/services/ReorderService";
import * as pagination from 'primevue/paginator';
import filterStore from '@/stores/filterStore'
import router from '@/router'

export const useOrdersStore = defineStore('ordersStore', {
  state: () => ({
    pageNumber: 0,
    pageSize: 0,
    pageState: {
        first: 1,
        page: 1,
        rows: 10
    },
    orders: [] as any[],
    cartOrders: [] as any[],
    cartCount: '',
    filters: {} as any,
    selectedOrder: ordersData[0],
    options: {
      locations: [] as any[],
      imageCarrierCodeTypes: [] as any[]
    },
    checkout: {
      expectedDate: null,// DateTime.now().plus({ hour: 2 }).startOf('hour').toJSDate(),
      purchaseOrder: null,
      expectedTime: null,
      shippingAddrress: null
    },
    totalRecords: 0,
    searchHistory: [] as any[],
  }),
  getters: {
    filteredOrders() {

    }
  },
  actions: {
      async getOrders() {
          const result  = await ReorderService.getRecentReorders(undefined,
          undefined,
          undefined,
          this.pageState.page,
          this.pageState.rows);
         
          if (Array.isArray(result)) {
            this.orders = [];
            this.totalRecords = 0;
          } else {
            const { reorderedData, totalRecords } = result;
            this.orders = reorderedData;
            this.totalRecords = totalRecords;
          }
          this.decorateOrders()
          
        console.log(this.orders)
      this.pageNumber =  this.pageState.page ;
      this.pageSize = this.pageState.rows;
      this.selectedOrder = this.orders[0]
      },
      async getCartCount() {
          this.cartCount = await ReorderService.getCartCount()
          console.log(this.cartCount)
      },
      async getCart() {
          this.cartOrders = await ReorderService.getCart()
          this.decorateCartOrders()
          console.log(this.cartOrders)
      },
      async discardOrder(id: string) {
          console.log('order to be discarded'+id)
          return await ReorderService.discardOrder(id)
      },
    async getOrderById(id: string) {
      if (id != null && id != undefined) {
        this.selectedOrder = this.orders.find((order: any) => order.sgsId === id)
        let details = JSON.parse(JSON.stringify(await ReorderService.getOrderDetails(id)))
        this.selectedOrder.description = details.jobDescription
        this.selectedOrder.colors = Array.from(details.colors)
        this.selectedOrder.colors.map(x => {if(!(x as any)['sets'])(x as any)['sets'] = 0});
        (this.selectedOrder as any)['customerDetails'] =  details.customerDetails
        this.selectedOrder.barcodes = details.barcode
        this.selectedOrder.cust1UpDie = details.techSpec.cust1UpDie
        this.selectedOrder.printProcess = details.techSpec.printProcessDescription
        this.selectedOrder.substrate = details.techSpec.substrate
        this.selectedOrder.surfaceReverseSprint = details.techSpec.surfaceReversePrint
        this.selectedOrder.plateRelief = details.techSpec.plateRelief
        this.selectedOrder.plateThickness = details.techSpec.thicknessDesc
        this.selectedOrder.numberAcrossCylinder = details.techSpec.numberAcrossCylinder
        this.selectedOrder.numberAroundCylinder = details.techSpec.numberAroundCylinder
        this.selectedOrder.dispro = details.techSpec.dispro
        this.selectedOrder.plateType = details.techSpec.plateType

        return this.selectedOrder
      }
    },
      async setFilters(filters: any) {
   
        this.filters = { ...this.filters, ...filters }
        const result = await ReorderService.getRecentReorders(filters.query,  filters.sortBy,
          filters.sortOrder,
          this.pageState.page,
          this.pageState.rows, filters, filterStore);
          this.pageNumber = this.pageState.page;
          this.pageSize = this.pageState.rows;
          if (Array.isArray(result)) {
            this.orders = [];
            this.totalRecords = 0;
          } else {
            const { reorderedData, totalRecords } = result;
            this.orders = reorderedData;
            this.totalRecords = totalRecords;
          }

          this.decorateOrders()
      this.selectedOrder = this.orders[0]
    },
    resetFilters() {
      this.filters['itemCode'] = null
      this.filters['orderDate'] = null
      this.filters['printerName'] = null
      this.filters['printerSite'] = null
      this.filters['printerReference'] = null
      this.filters['poNumber'] = null
      this.filters['sgsReferenceNumberList'] = null
      this.filters['imageCarrierId'] = null
      this.filters['imageCarrierCode'] = null
      this.filters['imageCarrierCode'] = null
      filterStore.state.brandNameFilter = null
      filterStore.state.descriptionFilter = null
      filterStore.state.packTypeFilter = null
      filterStore.state.orderStatusFilter = null
      filterStore.state.sortFields = null
      },
    decorateOrders() {
        for (let i = 0; i < this.orders.length; i++) {
            if (!this.orders[i].thumbNail) {
                this.orders[i].thumbNail = new URL('@/assets/images/no_thumbnail.png', import.meta.url);
            }
            else if (this.orders[i].thumbNail) {
                this.orders[i].thumbNail = decodeURIComponent(this.orders[i].thumbNail);
            }
            this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
        }  
      },
      decorateCartOrders() {
          for (let i = 0; i < this.cartOrders.length; i++) {
              if (!this.cartOrders[i].thumbNailPath) {
                  this.cartOrders[i].thumbNailPath = new URL('@/assets/images/no_thumbnail.png', import.meta.url);
              }
              else if (this.cartOrders[i].thumbNailPath) {
                  this.cartOrders[i].thumbNailPath = decodeURIComponent(this.cartOrders[i].thumbNailPath);
              }
          }
      },
    initAdvancedFilters() {
      this.options.locations = [
        { label: 'Lancaster', value: 1 },
        { label: 'Concord NH', value: 2 },
        { label: 'Neenah, WI', value: 3 }
      ]

      this.resetFilters()
    },
    async setFilter(field: any, value: any) {
      this.filters[field] = value

    },
    updateCheckout(checkout: any) {
      this.checkout = { ...checkout }
    },
    // color update flow
    updateColor({ id, field, value }: any): void {
      const colors = this.selectedOrder["colors"];
      const colorIndex = colors.findIndex((color: any) => color.mcgColourId == id);
      (this.selectedOrder.colors[colorIndex] as any)[field] = value;
    },
    // Order Table Actions
    addToCart(order: any) {
      console.log('addToCart', order)
    },
    reorder(order: any) {
      router.push(`/dashboard/${order.sgsId}`)
    },
    cancelOrder(order: any) {
      console.log('cancelOrder', order)
    },
    getSearchHistory(history: any) {
      this.searchHistory = [...history];
    },
  },
});
