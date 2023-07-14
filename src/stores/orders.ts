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
    orders: [] as any[],
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

    },
    cart(state) {
      return state.orders.filter((order, i) => i <= 2)
    }
  },
  actions: {
      async getOrders(
        pageState: pagination.PageState = {
          first: 0,
          page: 0,
          rows: 10
        }) {
          const result  = await ReorderService.getRecentReorders(undefined,
          undefined,
          undefined,
          pageState.page + 1,
          pageState.rows);
         
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
      this.pageNumber =  pageState.page + 1;
      this.pageSize =  pageState.rows;
      this.selectedOrder = this.orders[0]
    },
    async getOrderById(id: string) {
      if (id != null && id != undefined) {
        this.selectedOrder = this.orders.find((order: any) => order.sgsId === id)
        let details = JSON.parse(JSON.stringify(await ReorderService.getOrderDetails(id)))
        this.selectedOrder.description = details.jobDescription
        this.selectedOrder.colors = Array.from(details.colors)
        this.selectedOrder.colors.map(x => {if(!(x as any)['sets'])(x as any)['sets'] = 0});
        (this.selectedOrder as any)['customerDetails'] =  details.customerDetails
        return this.selectedOrder
      }
    },
      async setFilters(filters: any) {
   
        this.filters = { ...this.filters, ...filters }
        const result = await ReorderService.getRecentReorders(filters.query,  filters.sortBy,
          filters.sortOrder,
          this.pageNumber,
          this.pageSize, filters, filterStore);

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
