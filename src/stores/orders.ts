import ordersData from "@/data/mock/orders";
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import filterStore from "@/stores/filterStore";
import router from "@/router";

export const useOrdersStore = defineStore("ordersStore", {
  state: () => ({
    pageState: {
      first: 1,
      page: 1,
      rows: 10,
    },
    orders: [] as any[],
    loadingOrders: true,
    loadingOrder: false,
    cartOrders: [] as any[],
    cartCount: 0,
    filters: {} as any,
    selectedOrder: ordersData[0],
    options: {
      locations: [] as any[],
      imageCarrierCodeTypes: [] as any[],
    },
    checkout: {
      expectedDate: null,
      purchaseOrder: null,
      expectedTime: null,
      notes: null,
    },
    totalRecords: 0,
    searchHistory: [] as any[],
    statusList: [
      {
        name: "Completed",
        value: 4,
      },
      {
        name: "Submitted",
        value: 2,
      },
      {
        name: "Cancelled",
        value: 3,
      },
      {
        name: "Draft",
        value: 1,
      },
    ],
  }),
  getters: {
    filteredOrders() {},
  },
  actions: {
    async getOrders() {
      this.loadingOrders = true;
      const result = await ReorderService.getRecentReorders(
        4,
        undefined,
        undefined,
        undefined,
        this.pageState.page,
        this.pageState.rows
      );
      this.loadingOrders = false;
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      }
      this.decorateOrders();

      console.log(this.orders);
      this.selectedOrder = this.orders[0];
    },
    async getCartCount() {
      this.cartCount = await ReorderService.getCartCount();
      console.log(this.cartCount);
    },
    async getCart() {
      this.cartOrders = await ReorderService.getCart();
      this.decorateCartOrders();
      console.log(this.cartOrders);
    },
    async discardOrder(id: string) {
      console.log("order to be discarded" + id);
      return await ReorderService.discardOrder(id);
    },
    async setOrderInStore(result: any) {
      let details = JSON.parse(JSON.stringify(result));
      this.selectedOrder = details;
    },
    async getOrderById(id: any) {
      this.loadingOrder = true;
      if (id != null && id != undefined) {
        if (!isNaN(parseFloat(id)) && isFinite(id)) {
          let order = this.cartOrders.find((order: any) => order.id === id);
          if (order != null) this.selectedOrder = order;
          else {
            this.selectedOrder = this.orders.find(
              (order: any) => order.sgsId === id
            );
            let details = JSON.parse(
              JSON.stringify(
                await ReorderService.getPhotonReorderDetails(
                  this.selectedOrder.id
                )
              )
            );
            this.mapColorAndCustomerDetailsToOrder(details,(this.selectedOrder as any)["statusId"]);
          }
        } else {
          this.selectedOrder = this.orders.find(
            (order: any) => order.sgsId === id
          );

          let details = JSON.parse(
            JSON.stringify(await ReorderService.getOrderDetails(id))
          );
          this.selectedOrder.description = details.jobDescription;
          this.mapColorAndCustomerDetailsToOrder(details,(this.selectedOrder as any)["statusId"]);
          this.selectedOrder.barcodes = details.barcode;
          this.selectedOrder.cust1UpDie = details.techSpec.cust1UpDie;
          this.selectedOrder.printProcess =
            details.techSpec.printProcessDescription;
          this.selectedOrder.substrate = details.techSpec.substrate;
          this.selectedOrder.surfaceReverseSprint =
            details.techSpec.surfaceReversePrint;
          this.selectedOrder.plateRelief = details.techSpec.plateRelief;
          this.selectedOrder.plateThickness = details.techSpec.thicknessDesc;
          this.selectedOrder.numberAcrossCylinder =
            details.techSpec.numberAcrossCylinder;
          this.selectedOrder.numberAroundCylinder =
            details.techSpec.numberAroundCylinder;
          this.selectedOrder.dispro = details.techSpec.dispro;
          this.selectedOrder.plateType = details.techSpec.plateType;
        }
        console.log(this.selectedOrder);
        this.loadingOrder = false;
        return this.selectedOrder;
      }
      this.loadingOrder = false;
    },

    async setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters };
      this.loadingOrders = true;
      const result = await ReorderService.getRecentReorders(
        filters.status,
        filters.query,
        filters.sortBy,
        filters.sortOrder,
        this.pageState.page,
        this.pageState.rows,
        filters,
        filterStore
      );
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      }
      this.loadingOrders = false;
      this.decorateOrders();
      this.selectedOrder = this.orders[0];
    },
    resetFilters() {
      this.filters["status"] = 4;
      this.filters["itemNumber"] = null;
      this.filters["orderDate"] = [];
      this.filters["printerName"] = null;
      this.filters["printerSite"] = null;
      this.filters["printerReference"] = null;
      this.filters["poNumber"] = null;
      this.filters["barcodeNumber"] = null;
      this.filters["sgsReferenceNumberList"] = null;
      this.filters["imageCarrierId"] = null;
      this.filters["imageCarrierCode"] = null;
      this.filters["imageCarrierCode"] = null;
      this.filters["printerPlateCode"] = null;
      this.filters["startDate"] = [];
      filterStore.state.brandNameFilter = null;
      filterStore.state.descriptionFilter = null;
      filterStore.state.packTypeFilter = null;
      filterStore.state.sortFields = null;
    },
    decorateOrders() {
      for (let i = 0; i < this.orders.length; i++) {
        if (!this.orders[i].thumbNailPath) {
          this.orders[i].thumbNailPath = new URL(
            "@/assets/images/no_thumbnail.png",
            import.meta.url
          );
        } else if (this.orders[i].thumbNailPath) {
          this.orders[i].thumbNailPath = decodeURIComponent(
            this.orders[i].thumbNailPath
          );
        }
        this.orders[i].submittedDate = DateTime.fromISO(
          this.orders[i].submittedDate
        ).toLocaleString(DateTime.DATETIME_MED);
        this.orders[i].selected = false;
      }
    },
    decorateCartOrders() {
      for (let i = 0; i < this.cartOrders.length; i++) {
        if (!this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = new URL(
            "@/assets/images/no_thumbnail.png",
            import.meta.url
          );
        } else if (this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = decodeURIComponent(
            this.cartOrders[i].thumbNailPath
          );
        }
        ReorderService.decorateColours(this.cartOrders[i].colors);
      }
    },
    initAdvancedFilters() {
      this.options.locations = [
        { label: "Lancaster", value: 1 },
        { label: "Concord NH", value: 2 },
        { label: "Neenah, WI", value: 3 },
      ];

      this.resetFilters();
    },
    async setFilter(field: any, value: any) {
      this.filters[field] = value;
    },
    updateCheckout(checkout: any) {
      this.checkout = { ...checkout };
      (this.selectedOrder as any).PO = this.checkout.purchaseOrder;
      (this.selectedOrder as any).expectedDate = this.checkout.expectedDate;
      (this.selectedOrder as any).Notes = this.checkout.notes;
    },
    // color update flow
    async updateColor({ id, field, value }: any) {
      const colors = this.selectedOrder["colors"];
      const colorIndex = colors.findIndex(
        (color: any) => color.jobTechSpecColourId == id
      );
      (this.selectedOrder.colors[colorIndex] as any)[field] = value;
      (this.selectedOrder.colors[colorIndex] as any)['originalSets'] = value;
      if (
        !isNaN(parseFloat(this.selectedOrder.id)) &&
        isFinite(this.selectedOrder.id as any) &&
        parseFloat(this.selectedOrder.id) > 0
      ) {
        let result = await ReorderService.updateDraft(this.selectedOrder);
        if (!result.success) {
          alert("error updating draft");
        }
      }
    },
    // Order Table Actions
    async addToCart(order: any) {
      if (await ReorderService.submitReorder(order, 1)) {
        this.cartCount = this.cartCount + 1;
        return true;
      } else {
        alert(" Error adding order to cart");
        return false;
      }
    },
    reorder(order: any) {
      router.push(`/dashboard/${order.sgsId}`);
    },
    cancelOrder(order: any) {
      console.log("cancelOrder", order);
    },
    getSearchHistory(history: any) {
      this.searchHistory = [...history];
    },
    mapColorAndCustomerDetailsToOrder(details: any, statusId: any) {
      this.selectedOrder.colors = Array.from(details.colors);
      this.selectedOrder.colors.map((x) => {
        ((x as any)["originalSets"] = (x as any)["sets"]),
            ((x as any)["sets"] = statusId === null?0:(x as any)["sets"]),
          ((x as any)["newColour"] = (x as any)["isNew"] ? "New" : "Common"),
          ((x as any)["colourTypeDesc"] = ReorderService.getColorType(
            (x as any)["colourType"]
          ));
      });
      (this.selectedOrder as any)["customerContacts"] =
        details.customerContacts;
    },
  },
});
