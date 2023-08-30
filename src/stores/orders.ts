import { faker } from '@faker-js/faker';
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";
import filterStore from "@/stores/filterStore";
import { useNotificationsStore } from '@/stores/notifications'
import { useCartStore } from '@/stores/cart'
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { sum } from 'lodash';
import { toRaw } from 'vue';
import type { ReorderDto } from "@/models/ReorderDto";
import { sortBy, groupBy, keysIn } from "lodash";

const handleSortPagnation = ( reorderedData: ReorderDto[],filters:any, pageState:any) : ReorderDto[] =>{
 
   // Filter by Sorting
   let resultForCache :any[] = reorderedData ;
     if(filters.sortBy){
       if(filters.sortOrder){
         resultForCache = sortBy(resultForCache , [filters.sortBy])
       }else{
         resultForCache = sortBy(resultForCache , [filters.sortBy]).reverse()
       }
     }
 
   return resultForCache.slice((pageState.page -1), (pageState.page * pageState.rows ))
 }

export const useOrdersStore = defineStore("ordersStore", {
  state: () => ({
    firstLoad: false,
    pageState: {
      first: 1,
      page: 1,
      rows: 10,
    },
    orders: [] as any[],
    loading: {
      ordersList: true,
      order: false,
      cart: false,
      reorder: false,
    },
    filters: {} as any,
    selectedOrder: null as any,
    successfullReorder: null as any,
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
    userRoleKey: "",
    isCancel: false,
    textSearchData: {
      query: '',
      data:  {
      reorderedData: [] as ReorderDto[],
      totalRecords: 0
      }
    } 
  }),
  getters: {
    flattenedColors: (state) => (orderType?: string) => {
      const flattenedColors = [] as any[]
      const colors = orderType === 'success' ||  state.isCancel === true ? state.successfullReorder?.colors : state.selectedOrder?.colors
      colors?.length && colors?.forEach((color: any) => {
        color?.plateType?.forEach((plate: any) => {
          flattenedColors.push({
            clientPlateColourRef: color.clientPlateColourRef,
            colourName: color.colourName,
            colourTypeDesc: color.colourTypeDesc,
            commonColourRef: color.commonColourRef,
            custCarrierIdNo: color.custCarrierIdNo,
            custImageIdNo: color.custImageIdNo,
            imageCarrierId: color.imageCarrierId,
            isActive: color.isActive,
            isNew: color.isNew,
            jobTechSpecColourId: color.jobTechSpecColourId,
            newColour: color.newColour,
            originalSets: color.originalSets,
            id: plate.id,
            plateTypeId: plate?.plateTypeId,
            plateThicknessId: plate?.plateThicknessId,
            plateThicknessDescription: state.isCancel? plate.plateThickness:plate.plateTypeDescription.plateThicknessDescription, 
            plateTypeDescription: state.isCancel? plate.plateType :plate.plateTypeDescription.label,
            sequenceNumber: color.sequenceNumber,
            sets: plate.sets
            
          })
        })
      })
      return flattenedColors
    },  
  },
  actions: {
    async getOrders() {
      const b2cAuth = useB2CAuthStore();
      let printerUserIds :number []= []
      if(b2cAuth.currentB2CUser.isLoggedIn){
          printerUserIds = b2cAuth.currentB2CUser.printerUserIds as number []
      }
      this.loading.ordersList = true;
      const result = await ReorderService.getRecentReorders(
        4,
        undefined,
        undefined,
        undefined,
        this.pageState.page,
        this.pageState.rows,
        { roleKey: this.userRoleKey, printerName:this.userPrinterName},
        undefined,
        undefined,
        printerUserIds
      );
      this.loading.ordersList = false;
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      }
      this.decorateOrders();
      // this.selectedOrder = this.orders[0];
    },
    async setOrderInStore(result: any) {
      let details = JSON.parse(JSON.stringify(result));
      this.successfullReorder = details;
    },
    async getOrderById(reorderId: any) {
      const cartStore = useCartStore()
      this.loading.order = true
      this.selectedOrder = null
      if (reorderId != null && reorderId != undefined) {
        if (!isNaN(parseFloat(reorderId)) && isFinite(reorderId)) {
          // Cart reorder
          const order = cartStore.cartOrders.find((order: any) => order.id === reorderId)
          if (order != null) {
            const groupedPlates = groupBy(order.colors, 'id')
            const colors = keysIn(groupedPlates).map((id: string) => {
              return {
                ...groupedPlates[id][0],
                plateType: groupedPlates[id].map((plate: any) => {
                  const { id, sets, plateTypeId, plateTypeDescription, plateThicknessId, plateThicknessDescription } = plate
                  return { id, sets, plateTypeId, plateTypeDescription, plateThicknessId, plateThicknessDescription }
                })
              }
            })
            const details = { ...order, colors }
            const plateTypes = this.mapPlateTypes(details)
            this.options.plateTypeDescription = plateTypes.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = details
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            this.mapColorAndCustomerDetailsToOrder(details, statusId, plateTypes);
          } else {
            // Dashboard photon reorder
            const photonOrder = this.orders.find((order: any) => order.sgsId === reorderId)
            const photonOrderDetails = photonOrder ? JSON.parse(JSON.stringify(await ReorderService.getPhotonReorderDetails(photonOrder?.id))) : null
            const groupedPlates = groupBy((photonOrderDetails?.colors || []), 'id')
            const colors = keysIn(groupedPlates).map((id: string) => {
              return {
                ...groupedPlates[id][0],
                plateType: groupedPlates[id].map((plate: any) => {
                  const { id, sets, plateTypeId, plateTypeDescription, plateThicknessId, plateThicknessDescription } = plate
                  return { id, sets, plateTypeId, plateTypeDescription, plateThicknessId, plateThicknessDescription }
                })
              }
            })
            const details = { ...photonOrder, ...photonOrderDetails, colors }         
            const plateTypes = this.mapPlateTypes(details)
            this.options.plateTypeDescription = plateTypes?.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = details
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            this.mapColorAndCustomerDetailsToOrder(details, statusId, plateTypes)
          }
        } else {
          // Dashboard SGS reorder
          this.selectedOrder = this.orders.find(
            (order: any) => order.sgsId === reorderId
          );

          let details = JSON.parse(
            JSON.stringify(await ReorderService.getOrderDetails(reorderId))
          );
          const plateTypes = this.mapPlateTypes(details)
          this.options.plateTypeDescription = plateTypes.filter((plateType: any) => plateType.value !== 256)

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
          this.mapColorAndCustomerDetailsToOrder(details, (this.selectedOrder as any)["statusId"], plateTypes);
        }
        this.loading.order = false;
        return this.selectedOrder;
      }
      this.loading.order = false;
    },

    async setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters };
      this.loading.ordersList = true;
      let printers = [] as string[]
      let printerIds = [] as number[]
      let  printerUserIds = [] as number []
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
          printerUserIds = b2cAuth.currentB2CUser.printerUserIds as number []
        })
        filters.roleKey = b2cAuth.currentB2CUser.roleKey
      }
            let result:
        | {
            reorderedData: ReorderDto[];
            totalRecords: number;
          }
        | never[];
      /* 
        If its is free text search then Pagination, Sorting, Filtering has to from stored data instead of API Call
        And Status should be completed (4)
    */
      if (
        this.textSearchData.query != '' &&
        this.textSearchData.query === filters.query && filters.status === 4
      ) {
        
        console.log('Showing result from Local Store');
       const reorderedData =  handleSortPagnation(this.textSearchData.data.reorderedData , filters,this.pageState)
        result =  {
          reorderedData : reorderedData,
          totalRecords : reorderedData.length
        }
      } else {
        result = await ReorderService.getRecentReorders(
          filters.status,
          filters.query,
          filters.sortBy,
          filters.sortOrder,
          this.pageState.page,
          this.pageState.rows,
          filters,
          filterStore,
          printers,
          printerUserIds
        );

        if (filters.query != '' && !!filters.query && filters.status === 4) {
          console.log('Saving Search Result in Local Store',filters);
          this.textSearchData.query = filters.query;
          if (Array.isArray(result)) {
            this.textSearchData.data = {
              reorderedData : [],
              totalRecords:0
            }
          }else{
            this.textSearchData.data =  {
              reorderedData : result.reorderedData !=null ?result.reorderedData : [],
              totalRecords:result.reorderedData.length
            }
         }

          const reorderedData =  handleSortPagnation(this.textSearchData.data.reorderedData , filters,this.pageState)
          result =  {
            reorderedData : reorderedData,
            totalRecords : reorderedData.length
          }

        } else {
          console.log('Clearing result from local store .. ');
          this.textSearchData.query = '';
          this.textSearchData.data = {
            reorderedData : [],
            totalRecords:0
          }
        }
      }
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      }
      this.loading.ordersList = false;
      this.decorateOrders();
      // this.selectedOrder = this.orders[0];
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
      if( typeof this.orders[i].submittedDate === 'string' && this.orders[i].submittedDate?.includes('T'))
        this.orders[i].submittedDate = DateTime.fromISO(
          this.orders[i].submittedDate
        ).toLocaleString(DateTime.DATETIME_MED);
        this.orders[i].selected = false;
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
    async updateColor({ checkboxId, field, value }: any) {
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.checkboxId === checkboxId)
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
      const selectedIndex = colours.findIndex(c => c.checkboxId === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        const totalSets = colour.plateType && colour.plateType.length && sum(colour.plateType.map((plate: any) => plate.checkboxId === params.checkboxId ? params.value : plate.sets))
        this.selectedOrder['colors'][selectedIndex] = {
          ...colour,
          plateType: [
            ...colour.plateType,
            { checkboxId: faker.datatype.uuid(), id: 0, plateTypeId: 0, plateTypeDescription: { label: '', value: '' }, plateThicknessId: 0, plateThicknessDescription: '', sets: 0, isEditable: true } as any
          ]
        }
      }
    },
    removePlate(params: any) {
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.checkboxId === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        if (colour) {
          const plateType = colour.plateType && colour.plateType.filter((plate: any) => plate.checkboxId !== params.checkboxId)
          this.selectedOrder['colors'][selectedIndex] = { ...colour, plateType }
        }
      }
    },
    updatePlate(params: any) {
      const notificationsStore = useNotificationsStore()
      const colours = this.selectedOrder['colors'] as any[]
      const selectedIndex = colours.findIndex(c => c.checkboxId === params.colourId)
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder['colors'][selectedIndex]
        if (colour) {
          const colorFirstPlateType = colour.plateType[0]
          const totalSets = colour.plateType && colour.plateType.length && sum(colour.plateType.map((plate: any) => {
            return plate.checkboxId === params.checkboxId && params.field === 'sets' ? params.value : plate.sets
          }))        
          const plateDetails = [...colour.plateType].map(plate => toRaw(plate))
          let plateToReplace = plateDetails && plateDetails.find(plate => plate.checkboxId === params.checkboxId)
          if (plateToReplace) {
            if (params.field === 'plateTypeDescription') {
              const plateType = this.options?.plateTypeDescription?.find(plateType => plateType.value === params.value)
              const hasPlateType = plateDetails.find(plateType => {
                // console.log(plateType.plateTypeDescription.value, params.value, plateType.plateTypeDescription.value === params.value)
                return plateType.plateTypeDescription.value === params.value
              })
              const { plateThicknessDescription, plateThicknessId } = colorFirstPlateType
              if (hasPlateType) {
                notificationsStore.addNotification('Warning', `Plate type ${plateType.label} already exists for this colour`, { severity: 'warn', life: null })
              }
              plateToReplace = { ...plateToReplace, plateTypeId: plateType.value, [params.field]: { ...plateType, plateThicknessDescription, plateThicknessId }, sets: totalSets >= 10 ? 0 : 1 }
              // console.log('plateTypeDescription', plateToReplace, plateType, params.field)
            } else if (params.field === 'sets') {
              // console.log('sets')
              if (totalSets > 10) {
                notificationsStore.addNotification('Warning', `You cannot have more than 10 sets reordered for 1 colour`, { severity: 'warn' })
                return
              } else {
                plateToReplace = { ...plateToReplace, [params.field]: params.value }
              }
            }
            const newPlates = plateDetails.map(plate => plate.checkboxId === plateToReplace?.checkboxId ? plateToReplace : plate)
            this.selectedOrder['colors'][selectedIndex].plateType = [...newPlates] as any[]

            this.updateComputedColorFields()
          }
        }
      }
    },
    validateColour(colour: any) {
      const notificationsStore = useNotificationsStore()
      const totalSets = colour.plateType && colour.plateType.length && sum(colour.plateType.map((plate: any) => plate.sets))        
      const plateTypes = colour.plateType && colour.plateType.map((plate: any) => plate.plateTypeDescription.value) 
      const hasUniquePlates = plateTypes.length === new Set(plateTypes).size
      const hasMixed = colour.plateType && colour.plateType.find((plate: any) => plate.sets > 0 && plate.plateTypeDescription.value === 256)  // 256 = Mixed plateTypeId
      const isValid = hasUniquePlates && totalSets <= 10 && !hasMixed
      if (hasMixed)
        notificationsStore.addNotification('Warning', `Warning, "Mixed" plate type cannot be used for ${colour.colourName}, please pick a plate type from the available list`, { severity: 'warn' })
      if (!hasUniquePlates)
        notificationsStore.addNotification('Warning', `You have selected the same plate type for ${colour.colourName}`, { severity: 'warn'})
      return isValid
    },
    updateComputedColorFields() {
      const { colors } = this.selectedOrder
      colors.forEach((color:any, index:number) => {
        const totalSets = color.plateType && color.plateType.length && sum(color.plateType.map((plate: any) => plate.sets))
        this.selectedOrder['colors'][index].totalSets = totalSets
      })
    },
    // Order Table Actions
    reorder(order: any) {
      router.push(`/dashboard/${order.sgsId}`);
    },
    async cancelOrder(orderId: number, isActive: boolean) {
         return await ReorderService.cancelOrder(orderId, isActive);
    },
    getSearchHistory(history: any) {
      this.searchHistory = [...history];
    },
    mapPlateTypes(details: any) { 
      return details?.plateTypes?.map((plateType: any) => {
        const thickness = details?.plateThicknesses?.find((thickness: any) => thickness?.thicknessId === plateType?.plateTypeId)
        return {
          label: plateType?.plateTypeName || plateType?.plateTypeDescription,
          value: plateType?.plateTypeId,
          plateThicknessDescription: thickness?.thicknessDesc ? thickness?.thicknessDesc : details?.techSpec?.thicknessDesc,
          plateThicknessId: thickness?.thicknessId ? thickness?.thicknessId : details?.techSpec?.thicknessId
        }
      })
    },
    mapColorAndCustomerDetailsToOrder(details: any, statusId: any, plateTypes: any[]) {
      const colors = Array.from(details && details.colors || [])
      this.selectedOrder.colors = colors?.map((color: any) => {
        const colorFirstPlateType = color.plateType[0]
        return {
          ...color,
          checkboxId: faker.datatype.uuid(),
          totalSets: color.plateType && color.plateType.length && sum(color.plateType?.map((plate: any) => plate.sets)),
          plateTypes: color.plateType && color.plateType.length
            ? color.plateType?.map((plate: any) => (`${plate.plateTypeDescription} [${plate.sets}]`)).join(', ')
            : '',        
          plateType: color.plateType?.map((colorPlateType: any) => {
            const selected = plateTypes?.find(plateType => plateType?.value === colorPlateType?.plateTypeId)
            const { plateThicknessDescription, plateThicknessId } = colorFirstPlateType
            return {
              ...colorPlateType,
              checkboxId: faker.datatype.uuid(),
              plateTypeDescription: { ...selected, plateThicknessDescription, plateThicknessId }
            }
          })
        }
      });
      this.selectedOrder.colors?.map((x:any) => {
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
