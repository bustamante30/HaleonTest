import ordersData from '@/data/mock/orders';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';
import ReorderService from "@/services/ReorderService";
import * as pagination from 'primevue/paginator'

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
      expectedDate: DateTime.now().plus({ hour: 2 }).startOf('hour').toJSDate(),
      purchaseOrder: null,
      shippingAddrress: null
    },
    totalRecords: 0
  }),
  getters: {
    filteredOrders() {

    },
    cart(state) {
      return state.orders.filter((order, i) => i <= 2)
    }
  },
  actions: {
      async getOrders( all: boolean = false,
        pageState: pagination.PageState = {
          first: 0,
          page: 0,
          rows: 10
        }) {
          const { first, rows } = pageState;
    const page = first / rows + 1;
    const pageSize = rows;
        const { reorderedData, totalRecords }  = await ReorderService.getRecentReorders(undefined,
          undefined,
          undefined,
          pageState.page + 1,
          pageState.rows);
      console.log("orderStore:"+ totalRecords);
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
          for (let i = 0; i < this.orders.length; i++) {
            if (!this.orders[i].thumbNail) {
                this.orders[i].thumbNail =  new URL('@/assets/images/no_thumbnail.png', import.meta.url);
            }
            else if (this.orders[i].thumbNail){
              this.orders[i].thumbNail = decodeURIComponent(this.orders[i].thumbNail);
            }
            this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
        }
        console.log(this.orders)
      //this.orders = ordersData;
      this.selectedOrder = this.orders[0]
    },
    async getOrderById(id: string) {
      this.selectedOrder = this.orders.find((order: any) => order.id === id) || ordersData[0] as any
    },
      async setFilters(filters: any) {
        this.filters = { ...this.filters, ...filters }
        const { reorderedData, totalRecords } = await ReorderService.getRecentReorders(filters.query,  filters.sortBy,
          filters.sortOrder,
          1, 
          this.pageSize, filters);
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
        console.log("orderStoreSetfilter:"+ totalRecords);
        for (let i = 0; i < this.orders.length; i++) {
          if (!this.orders[i].thumbNail) {
              this.orders[i].thumbNail = new URL('@/assets/images/no_thumbnail.png', import.meta.url);
          }
          this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
      }
        this.selectedOrder = this.orders[0]
        console.log(this.orders);
    },
    resetFilters() {
      this.filters['itemCode'] = null
      this.filters['orderDate'] = null
      this.filters['printerName'] = null
      this.filters['printerSite'] =  null
      this.filters['printerReference'] = null
      this.filters['poNumber'] = null
      this.filters['sgsReferenceNumberList'] = null
      this.filters['imageCarrierId'] = null
      this.filters['imageCarrierCode'] = null
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
    }
  },
});
