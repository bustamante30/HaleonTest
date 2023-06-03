import ordersData from "@/data/mock/orders";
import { defineStore } from "pinia";

export const useOrdersStore = defineStore("ordersStore", {
  state: () => ({
    orders: [],
    filters: {} as any,
    selectedOrder: null,
    options: {
      locations: [] as any[],
      imageCarrierCodeTypes: [] as any[]
    }
  }),
  getters: {
    filteredOrders() {

    }
  },
  actions: {
    async getOrders() {
      // this.orders = ordersData;
    },
    async getOrderById(id: string, state: any) {
      this.selectedOrder = this.orders.find((order: any) => order.id === id) as any
    },
    resetFilters() {
      this.filters['itemCode'] = null
      this.filters['orderDate'] = null
      this.filters['printerName'] = 'ABC Inc'
      this.filters['printerLocation'] = null
      this.filters['packagingReference'] = null
      this.filters['imageCarrierId'] = null
      this.filters['imageCarrierCode'] = { type: 'UPC', code: null }
    },
    initAdvancedFilters() {
      this.options.locations = [
        { label: 'Lancaster', value: 1 },
        { label: 'Concord NH', value: 2 },
        { label: 'Neenah, WI', value: 3 }
      ]
      this.options.imageCarrierCodeTypes = [
        { label: 'UPC Code', value: 'UPC' },
        { label: 'QR Code', value: 'QR' },
        { label: 'EAN Code', value: 'EAN' },
        { label: 'Data Matrix Code', value: 'DATA_MATRIX' },
      ]
      this.resetFilters()
    },
    setFilter(field: any, value: any) {
      this.filters[field] = value
    }
  },
});
