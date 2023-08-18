import {  } from '@/data/mock/plate-types'
import { faker } from '@faker-js/faker';
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import filterStore from "@/stores/filterStore";
import { useNotificationsStore } from '@/stores/notifications'
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { sum } from 'lodash';
import { toRaw } from 'vue';

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
    selectedOrder: null as any,
    options: {
      locations: [] as any[],
      imageCarrierCodeTypes: [] as any[],
      plateTypeDescription: [] as any[]
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
    userPrinterName: "",
    userRoleKey: ""
  }),
  getters: {
    flattenedColors: (state) => {
      const flattenedColors = [] as any[]
      const colors = state.selectedOrder && state.selectedOrder.colors
      colors && colors.forEach((color: any) => {
        color.plateType.forEach((plate: any) => {
          flattenedColors.push({
            sequenceNumber: color.sequenceNumber,
            clientPlateColourRef: color.clientPlateColourRef,
            colourName: color.colourName,
            imageCarrierId: color.imageCarrierId,
            originalSets: color.originalSets,
            colourTypeDesc: color.colourTypeDesc,
            newColour: color.newColour,
            commonColourRef: color.commonColourRef,
            plateTypeDescription: plate.plateTypeDescription, 
            sets: plate.sets
          })
        })
      })
      return flattenedColors
    },
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
        this.pageState.rows,
        { roleKey: this.userRoleKey, printerName:this.userPrinterName}
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
          if (order != null) {
            this.selectedOrder = order;
          }
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
            const plateTypes = this.mapPlateTypes(details)
            this.mapColorAndCustomerDetailsToOrder(details, (this.selectedOrder as any)["statusId"], plateTypes);
          }
        } else {
          this.selectedOrder = this.orders.find(
            (order: any) => order.sgsId === id
          );

          let details = JSON.parse(
            JSON.stringify(await ReorderService.getOrderDetails(id))
          );
          const plateTypes = this.mapPlateTypes(details)
          this.selectedOrder = this.selectedOrder || {}
          this.selectedOrder.description = details.jobDescription;
          this.selectedOrder.barcodes = details.barcode;
          this.selectedOrder.cust1UpDie = details.techSpec.cust1UpDie;
          this.selectedOrder.printProcess = details.techSpec.printProcessDescription;
          this.selectedOrder.substrate = details.techSpec.substrate;
          this.selectedOrder.surfaceReverseSprint = details.techSpec.surfaceReversePrint;
          this.selectedOrder.plateRelief = details.techSpec.plateRelief;
          this.selectedOrder.plateThickness = details.techSpec.thicknessDesc;
          this.selectedOrder.numberAcrossCylinder = details.techSpec.numberAcrossCylinder;
          this.selectedOrder.numberAroundCylinder = details.techSpec.numberAroundCylinder;
          this.selectedOrder.dispro = details.techSpec.dispro;
          this.selectedOrder.plateType = details.techSpec.plateType;
          this.options.plateTypeDescription = plateTypes
          this.mapColorAndCustomerDetailsToOrder(details, (this.selectedOrder as any)["statusId"], plateTypes);
        }
        this.loadingOrder = false;
        return this.selectedOrder;
      }
      this.loadingOrder = false;
    },

    async setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters };
      this.loadingOrders = true;
      let printers = [] as string[]
      let printerIds = [] as number[]
      //TODO: remove printers and sites unused code
      const authStore = useAuthStore();
      const b2cAuth = useB2CAuthStore();
      if(authStore.currentUser.isLoggedIn){
          // get printer Name 
        
          authStore.currentUser.prtLocation.forEach((printer:any) =>{
              if(printer.printerId && printer.printerId > 0){
                printers.push(printer.printerName)
                printerIds.push(printer.printerId)
              }
          })
        filters.roleKey = authStore.currentUser.roleKey
      }
      if(b2cAuth.currentB2CUser.isLoggedIn){
        b2cAuth.currentB2CUser.prtLocation.forEach((printer:any) =>{
          if(printer.printerId && printer.printerId > 0){
            printers.push(printer.printerName)
            printerIds.push(printer.printerId)
          }
        })
        filters.roleKey = authStore.currentUser.roleKey
      }
      const result = await ReorderService.getRecentReorders(
        filters.status,
        filters.query,
        filters.sortBy,
        filters.sortOrder,
        this.pageState.page,
        this.pageState.rows,
        filters,
        filterStore,
        printers,
        printerIds
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
    async initReorderOptions() {
      // this.options.plateTypeDescription = plateTypes
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
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.id === id)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        if (colour) {
          const plateType = [...colour.plateType].map(plate => {
            const p = toRaw(plate)
            return { ...p, [field]: value }
          })
          this.selectedOrder['colors'][selectedIndex].plateType = [...plateType]
          this.updateComputedColorFields()
        }
      }
    },
    // Add, Remove & Update Plates
    addPlate(params: any) {
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.id === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        this.selectedOrder['colors'][selectedIndex] = {
          ...colour,
          plateType: [
            ...colour.plateType,
            { id: faker.datatype.uuid(), plateTypeId: 0, plateTypeDescription: { label: '', value: '' }, plateThicknessId: 0, plateThicknessDescription: '', sets: 0, isEditable: true } as any
          ]
        }
      }
    },
    removePlate(params: any) {
      console.log('removePlate', params)
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.id === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        if (colour) {
          const plateType = colour.plateType && colour.plateType.filter((plate: any) => plate.id !== params.id)
          this.selectedOrder['colors'][selectedIndex] = { ...colour, plateType }
        }
      }
    },
    updatePlate(params: any) {
      // console.log('updatePlate', params)
      const notificationsStore = useNotificationsStore()
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.id === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        if (colour) {
          const plateDetails = [...colour.plateType].map(plate => toRaw(plate))
          let plateToReplace = plateDetails && plateDetails.find(plate => plate.id === params.id)
          // console.log('plateToReplace', plateToReplace, plateToReplace?.id, params)
          if (plateToReplace) {
            if (params.field === 'plateTypeDescription') {
              const plateType = this.options?.plateTypeDescription?.find(plateType => plateType.value === params.value)
              const hasPlateType = plateDetails.find(plateType => {
                console.log(plateType.plateTypeDescription.value, params.value, plateType.plateTypeDescription.value === params.value)
                return plateType.plateTypeDescription.value === params.value
              }) 
              if (hasPlateType)
                notificationsStore.addNotification('Warning', `Plate type ${params.value} already exists for this colour`, { severity: 'warn' })
              else
                plateToReplace = { ...plateToReplace, [params.field]: { ...plateType }, sets: 1 }
            } else if (params.field === 'sets') {
              // Logic to validate totalSets <= 10
              // const totalSets = colour.plateType && colour.plateType.length && sum(colour.plateType.map((plate: any) => plate.sets))
              // if (totalSets + parseInt(params?.value) > 10)
              //   notificationsStore.addNotification('Warning', `Total sets cannot exceed 10 for a colour`, { severity: 'warn' })
              // else
              plateToReplace = { ...plateToReplace, [params.field]: params.value }
            }
            const newPlates = plateDetails.map(plate => plate.id === plateToReplace?.id ? plateToReplace : plate)
            this.selectedOrder['colors'][selectedIndex].plateType = [...newPlates] as any[]

            this.updateComputedColorFields()
          }
        }
      }
    },
    updateComputedColorFields() {
      const { colors } = this.selectedOrder
      colors.forEach((color:any, index:number) => {
        const totalSets = color.plateType && color.plateType.length && sum(color.plateType.map((plate: any) => plate.sets))
        this.selectedOrder['colors'][index].totalSets = totalSets
      })
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
    mapPlateTypes(details: any) {
      return details?.plateTypes?.map((plateType: any) => {
        const thickness = details?.plateThicknesses?.find((thickness: any) => thickness?.thicknessId === plateType?.plateTypeId)
        return { label: plateType?.plateTypeName, value: plateType?.plateTypeId, plateThicknessDescription: thickness?.thicknessDesc ? thickness?.thicknessDesc : details?.techSpec?.thicknessDesc }
      })
    },
    mapColorAndCustomerDetailsToOrder(details: any, statusId: any, plateTypes: any[]) {
      const colors = Array.from(details.colors || [])
      this.selectedOrder.colors = colors?.map((color: any) => {
        return {
          ...color,
          id: faker.datatype.uuid(),
          totalSets: color.plateType && color.plateType.length && sum(color.plateType.map((plate: any) => plate.sets)),
          plateTypes: color.plateType && color.plateType.length
            ? color.plateType.map((plate: any) => (`${plate.plateTypeDescription} [${plate.sets}]`)).join(', ')
            : '',        
          plateType: color.plateType.map((colorPlateType: any) => {
            const selected = plateTypes?.find(plateType => plateType?.value === colorPlateType?.plateTypeId)
            return {
              ...colorPlateType,
              id: faker.datatype.uuid(),
              plateTypeDescription: { ...selected }
            }
          })
        }
      });
      this.selectedOrder.colors.map((x:any) => {
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
