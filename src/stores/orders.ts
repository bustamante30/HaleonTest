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

const handleSortPagnation = ( reorderedData: ReorderDto[],filters:any, pageState:any, columnFilter: any = null) : ReorderDto[] =>{
    //Filter by column filters
    let resultForCache :any[] = reorderedData ;
    if (columnFilter != null) {
      if (columnFilter.state.brandNameFilter != null) {
        const brandNameFilter = columnFilter.state.brandNameFilter.toLowerCase();
        resultForCache = resultForCache.filter(item => item.brandName && item.brandName.toLowerCase().includes(brandNameFilter));
      }
      if (columnFilter.state.descriptionFilter != null) {
        const productDescriptionFilter = columnFilter.state.descriptionFilter.toLowerCase();
        resultForCache = resultForCache.filter(item => item.description && item.description.toLowerCase().includes(productDescriptionFilter));
      }
      if (columnFilter.state.packTypeFilter != null) {
        const packTypeFilter = columnFilter.state.packTypeFilter.toLowerCase();
        resultForCache = resultForCache.filter(item => item.packType && item.packType.toLowerCase().includes(packTypeFilter));
      }
    }
  
   // Filter by Sorting
   //let resultForCache :any[] = reorderedData ;
     if(filters.sortBy){
        if(filters?.sortBy?.toLowerCase().includes('date')){
          resultForCache = sortBydate(resultForCache);
        }else{
          resultForCache = sortBy(resultForCache , [filters.sortBy])
        }
        
        if(!filters.sortOrder){
          resultForCache = resultForCache.reverse()
        }
     }
     console.log('totalCount', resultForCache.length)
   return resultForCache.slice((pageState.page -1), (pageState.page * pageState.rows ))
 }

 const sortBydate = (orders) =>{
  return orders.sort(function compare(a, b) {
    var dateA:any = new Date(a.submittedDate);
    var dateB:any = new Date(b.submittedDate);
    return dateA - dateB;
  });
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
      ordersList: false,
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
        // plateType for MySGS and plateTypes for Photon
        (color?.plateType || color?.plateTypes).forEach((plate: any) => {
          flattenedColors.push({
            clientPlateColourRef: color.clientPlateColourRef,
            colourName: color.colourName,
            colourType: color.colourType,
            commonColourRef: color.commonColourRef,
            custCarrierIdNo: color.custCarrierIdNo,
            custImageIdNo: color.custImageIdNo,
            imageCarrierId: color.custImageIdNo?color.custImageIdNo:(color.custCarrierIdNo?color.custCarrierIdNo:color.imageCarrierId),
            serialNumber: plate.serialNumber,
            isActive: true,
            isNew: color.isNew,
            jobTechSpecColourId: color.jobTechSpecColourId,
            newColour: color.newColour === undefined ? color.isNew: color.newColour,
            originalSets: plate.sets,
            id: plate.id,
            plateTypeId: plate?.plateTypeId,
            plateThicknessId: plate?.plateThicknessId,
            plateThicknessDescription: plate.plateThickness || plate.plateTypeDescription.plateThicknessDescription || plate.plateThicknessDescription,
            plateTypeDescription: plate.plateType || plate.plateTypeDescription.label || plate.plateTypeDescription,
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
        this.filters?.query? this.filters.query : undefined,
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
      this.checkout = { expectedDate: null, purchaseOrder: null, expectedTime: null, notes: null, }
      if (reorderId != null && reorderId != undefined) {
        if (!isNaN(parseFloat(reorderId)) && isFinite(reorderId)) {
          // Cart reorder
          const order = cartStore.cartOrders.find((order: any) => order.id === reorderId)
          if (order != null) {
            const plateTypes = await order?.plateTypes?.length ? this.mapPlateTypes(order) : this.mapColorPlateTypes(order.colors)
            this.options.plateTypeDescription = plateTypes.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = order
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            this.mapColorAndCustomerDetailsToOrder(this.selectedOrder, statusId, plateTypes);
          } else {
            // Dashboard photon reorder
            const photonOrder = this.orders.find((order: any) => order.sgsId === reorderId)
            const photonOrderDetails = photonOrder ? JSON.parse(JSON.stringify(await ReorderService.getPhotonReorderDetails(photonOrder?.id))) : null
            const details = { ...photonOrder, ...photonOrderDetails }
            if (details?.plateTypes?.length) {
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
            }
            // const plateTypes =  await this.mapColorPlateTypes(details?.colors) // details?.plateTypes?.length ? await this.mapPlateTypes(details) : await this.mapColorPlateTypes(details.colors)
           this.mapColorPlateTypes(details?.colors).then((plateTypes: any) => {
            this.options.plateTypeDescription = plateTypes?.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = details
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            if(statusId && plateTypes.length)
              this.mapColorAndCustomerDetailsToOrder(details, statusId, plateTypes)
           })
           await this.getBarcodeAndShirtailForPhotonOrder(photonOrder)
          }
        } else {
          // Dashboard SGS reorder (MySGS, Photon)
          this.selectedOrder = this.orders.find(
            (order: any) => order.sgsId === reorderId
          );

          let details = JSON.parse(
            JSON.stringify(await ReorderService.getOrderDetails(reorderId))
          );
          // details.plateTypes will be there for SGS orders
          const plateTypes = await details?.plateTypes?.length ? this.mapPlateTypes(details) : this.mapColorPlateTypes(details.colors)
          this.options.plateTypeDescription = plateTypes?.filter((plateType: any) => plateType.value !== 256)
          this.selectedOrder = this.selectedOrder || {}
          if(details.printerName!="")
            this.selectedOrder.printerName = details.printerName
          // Bug -203039 - Get API is not returning full description so using description from Search api as such .
          // this.selectedOrder.description = details.jobDescription;
          this.selectedOrder.barcodes = details.barcode;
          this.selectedOrder.packagingReference = details.jobDetails.packagingReference;
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
          this.selectedOrder.isActive = true;
          this.selectedOrder.pdfUris = details.pdfUris;
          this.selectedOrder.variety = details.jobDetails.variety;
          this.selectedOrder.thumbNailPath = details.thumbNailPath;
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
          }else{
            printers.push(b2cAuth.currentB2CUser.printerName)
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
       const reorderedData =  handleSortPagnation(this.textSearchData.data.reorderedData , filters,this.pageState, filterStore)
        result =  {
          reorderedData : reorderedData,
          totalRecords : this.textSearchData.data.reorderedData.length
        }
      } else {
        result = await ReorderService.getRecentReorders(
          filters?.query != '' &&  filters.query != null ? 4 : filters.status,
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
              totalRecords: result.reorderedData.length
            }
         }

          const reorderedData =  handleSortPagnation(this.textSearchData.data.reorderedData , filters,this.pageState)
          result =  {
            reorderedData : reorderedData,
            totalRecords : this.textSearchData.data.reorderedData.length
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
    },
    async getBarcodeAndShirtailForPhotonOrder(photonOrder: any) {
      const barcodeDetails = photonOrder ? JSON.parse(JSON.stringify(await ReorderService.getPhotonBarcode(photonOrder?.id))) : null
      const shirttailDetails = photonOrder ? JSON.parse(JSON.stringify(await ReorderService.getPhotonShirttail(photonOrder?.id))) : null
      this.selectedOrder = this.selectedOrder || {}
      if (barcodeDetails !== null)
        this.selectedOrder.barcodes = barcodeDetails;
      this.selectedOrder.cust1UpDie = shirttailDetails?.cust1UpDie;
      this.selectedOrder.printProcess = shirttailDetails?.printProcessDescription;
      this.selectedOrder.substrate = shirttailDetails?.substrate;
      this.selectedOrder.surfaceReverseSprint = shirttailDetails?.surfaceReversePrint;
      this.selectedOrder.plateRelief = shirttailDetails?.plateRelief;
      this.selectedOrder.plateThickness = shirttailDetails?.thicknessDesc;
      this.selectedOrder.numberAcrossCylinder = shirttailDetails?.numberAcrossCylinder;
      this.selectedOrder.numberAroundCylinder = shirttailDetails?.numberAroundCylinder;
      this.selectedOrder.dispro = shirttailDetails?.dispro;
      this.selectedOrder.plateType = shirttailDetails?.plateType;
      this.selectedOrder.isActive = true;
    },
    resetFilters() {
      this.filters["query"] = "";
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
         }
        else if (this.orders[i].thumbNailPath) {
          this.orders[i].thumbNailPath = 
            this.orders[i].thumbNailPath
          ;
        }
        if( typeof this.orders[i].submittedDate === 'string' && this.orders[i].submittedDate?.includes('T'))
        {
          let formattedDate:string = (this.orders[i].submittedDate+'').includes('Z')? this.orders[i].submittedDate : this.orders[i].submittedDate+'Z'
          this.orders[i].submittedDate = DateTime.fromISO(formattedDate).toLocaleString(DateTime.DATETIME_MED);
        }
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
    async updatePlate(params: any) {
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
      const hasEmptyPlateDescription = colour.plateType && colour.plateType.find((plate: any) => plate.sets > 0 && !plate.plateTypeDescription.value)  // 256 = Mixed plateTypeId
      const isValid = hasUniquePlates && totalSets <= 10 && !hasMixed && !hasEmptyPlateDescription
      if (hasEmptyPlateDescription)
        notificationsStore.addNotification('Warning', `Please confirm the plate type for ${colour.colourName} from the available plate list`, { severity: 'warn' })
      if (hasMixed)
        notificationsStore.addNotification('Warning', `Please confirm the plate type for ${colour.colourName} from the available plate list`, { severity: 'warn' })
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
          label: plateType?.plateTypeName,
          value: plateType?.plateTypeId,
          plateThicknessDescription: thickness?.thicknessDesc ? thickness?.thicknessDesc : details?.techSpec?.thicknessDesc,
          plateThicknessId: thickness?.thicknessId ? thickness?.thicknessId : details?.techSpec?.thicknessId,
          isActive: true
        }
      })
    },
    // For Photon Orders
    async mapColorPlateTypes(colors: any[]) {
      const plateTypes = [] as any[]
      colors?.forEach((color: any) => {
        color?.plateTypes?.forEach((plateType: any) => {
          plateTypes.push({
            label: plateType?.plateType,
            value: plateType?.plateTypeId,
            plateThicknessDescription: plateType?.plateThickness,
            plateThicknessId: plateType?.plateThicknessId,
            isActive: true
          })
        })
      })
      return plateTypes
    },
    mapColorAndCustomerDetailsToOrder(details: any, statusId: number, plateTypes: any[]) {
      const colors = Array.from(details && details?.colors || [])
      this.selectedOrder.colors = colors?.map((color: any) => {
        const colorFirstPlateType = color?.plateType && color?.plateType[0]
        return {
          ...color,
          checkboxId: faker.datatype.uuid(),
          totalSets: color.plateType && color.plateType.length && sum(color.plateType?.map((plate: any) => plate.sets)),
          plateType: color.plateType?.map((colorPlateType: any) => {
            const selected = plateTypes?.find(plateType => plateType?.value === colorPlateType?.plateTypeId)
            const { plateThicknessDescription, plateThicknessId } = colorFirstPlateType
            return {
              ...colorPlateType,
              checkboxId: faker.datatype.uuid(),
              plateTypeDescription: { ...selected, plateThicknessDescription, plateThicknessId }
            }
          }),
          isActive:true
        }
      });
      this.selectedOrder.colors?.map((x:any) => {
        ((x as any)["originalSets"] = (x as any)["sets"]),
            ((x as any)["sets"] = statusId === null?0:(x as any)["sets"]),
          ((x as any)["newColour"] = (x as any)["isNew"] ? "New" : "Common")
      });
      (this.selectedOrder as any)["customerContacts"] =
        details.customerContacts;
    },
    
  },
});
