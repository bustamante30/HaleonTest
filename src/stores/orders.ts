import ordersData from '@/data/mock/orders';
import colorsData from "@/data/mock/colors";
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';
import ReorderService from "@/services/ReorderService";
import * as pagination from 'primevue/paginator';
import filterStore from '@/stores/filterStore'

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
    async getOrders(
      pageState: pagination.PageState = {
        first: 0,
        page: 0,
        rows: 10
      }) {
      const { reorderedData, totalRecords } = await ReorderService.getRecentReorders(undefined,
        undefined,
        undefined,
        pageState.page + 1,
        pageState.rows);

      this.orders = reorderedData;
      this.totalRecords = totalRecords;
      for (let i = 0; i < this.orders.length; i++) {
        if (!this.orders[i].thumbNail) {
          this.orders[i].thumbNail = new URL('@/assets/images/no_thumbnail.png', import.meta.url);
        }
        else if (this.orders[i].thumbNail) {
          this.orders[i].thumbNail = decodeURIComponent(this.orders[i].thumbNail);
        }
        this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
      }
      this.pageNumber = pageState.page + 1;
      this.pageSize = pageState.rows;
      this.selectedOrder = this.orders[0]
    },
    async getOrderById(id: string) {
      if (id != null && id != undefined) {
        this.selectedOrder = this.orders.find((order: any) => order.sgsId === id)

        let details = JSON.parse(JSON.stringify(await ReorderService.getOrderDetails(id)))
        this.selectedOrder.colors = Array.from(details.colors)
        this.selectedOrder.colors.map(x=>x['sets'] = 0)
        return this.selectedOrder
      }
    },
    async setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters }
      console.log("ColumnFilter:" + filterStore.state.brandNameFilter);
      const { reorderedData, totalRecords } = await ReorderService.getRecentReorders(filters.query, filters.sortBy,
        filters.sortOrder,
        this.pageNumber,
        this.pageSize, filters, filterStore);
      this.orders = reorderedData;
      this.totalRecords = totalRecords;
      console.log("ColumnFilteredOrders:" + this.orders.length);
      for (let i = 0; i < this.orders.length; i++) {
        if (!this.orders[i].thumbNail) {
          this.orders[i].thumbNail = new URL('@/assets/images/no_thumbnail.png', import.meta.url);
        }
        this.orders[i].submittedDate = DateTime.fromISO(this.orders[i].submittedDate).toLocaleString(DateTime.DATETIME_MED)
      }
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
    // Reorder flow
    updateColor({ id, field, value }: any): void {
      const colors = this.selectedOrder["colors"];
      const colorIndex = colors.findIndex((color: any) => color.id == id);
      this.selectedOrder.colors[colorIndex][field] = value;
      console.log(id, field, value, colorIndex);
    },
  },
});
