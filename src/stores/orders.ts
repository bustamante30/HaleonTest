import ordersData from '@/data/mock/orders';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';
import ReorderService from "@/services/ReorderService";

export const useOrdersStore = defineStore('ordersStore', {
  state: () => ({
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
    }
  }),
  getters: {
    filteredOrders() {

    },
    cart(state) {
      return state.orders.filter((order, i) => i <= 2)
    }
  },
  actions: {
      async getOrders() {

          this.orders = await ReorderService.getRecentReorders()
          for (let i = 0; i < this.orders.length; i++) {
              this.orders[i].thumbNail = `data:image;base64,` + this.orders[i].thumbNail
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
        this.orders = await ReorderService.getRecentReorders(filters.query, filters)
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].thumbNail!=null)
                this.orders[i].thumbNail = `data:image;base64,` + this.orders[i].thumbNail
            this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
        }
        this.selectedOrder = this.orders[0]
        console.log(this.orders);
    },
    resetFilters() {
      this.filters['itemCode'] = null
      this.filters['orderDate'] = null
      this.filters['printerName'] = '31138'
      this.filters['printerSite'] =  null
      this.filters['packagingReference'] = null
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
