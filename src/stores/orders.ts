import ordersData from "@/data/mock/orders";
import { defineStore } from "pinia";


export const useOrdersStore = defineStore("ordersStore", {
  state: () => ({
    orders: [] as { id: string; preview: boolean; select: boolean; orderDate: Date; brandName: string; name: string; image: string; weight: string; itemCode: string; printerName: string; printerLocation: string; packType: string; mySGSNumber: string; }[],
    filters: {} as any,
    selectedOrder: ordersData[0],
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
      console.log('Getting recent orders')
      this.orders = ordersData;
      this.selectedOrder = this.orders[0]
    },
    async getOrderById(id: string) {
      this.selectedOrder = this.orders.find((order: any) => order.id === id) || ordersData[0] as any
    },
    setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters }
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
