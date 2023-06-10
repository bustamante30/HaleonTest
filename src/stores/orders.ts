import ordersData from '@/data/mock/orders';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';

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
      this.filters['printerLocation'] =  { type: 'SEL', code: null }
      this.filters['packagingReference'] = null
      this.filters['previousPONumber'] = null
      this.filters['imageCarrierId'] = null
      this.filters['imageCarrierCode'] = { type: 'SEL', code: null }
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
    },
    updateCheckout(checkout: any) {
      this.checkout = { ...checkout }
    }
  },
});
