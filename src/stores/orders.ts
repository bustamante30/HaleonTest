import { colorDecorator, mapPhotonOrderDetail, validation, newFilterProps, flattenColors, mapColorPlateTypes, mapPlateTypes, mapSgsOrderDetail } from './utils';
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import { faker } from '@faker-js/faker';
import { sum, sortBy} from "lodash";
import { toRaw } from 'vue';
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useCartStore } from '@/stores/cart'
import { useNotificationsStore } from '@/stores/notifications'
import filterStore from "@/stores/filterStore";
import ReorderService from "@/services/ReorderService";
import router from "@/router";
import type { ReorderDto } from "@/models/ReorderDto";
import { useAuthStore } from './auth';

const handleSortPagination = ( reorderedData: ReorderDto[],filters:any, pageState:any, columnFilter: any = null) : ReorderDto[] =>{

   // Filter by Date

   const startDate = filters.startDate[0]?filters.startDate[0] : filters.startDate
   const endDate = filters.startDate[1]?filters.startDate[1] : filters.endDate
 
   let filteredresult :any[] =  []   
   if(filters.query === '' ||filters.query === null ){
     reorderedData.forEach(order => {
       let date;
       if(typeof order.submittedDate === 'string' && order.submittedDate?.includes('T')){
         date = DateTime.fromISO(order.submittedDate).toMillis()
     }else{
      const submittedDate = order.submittedDate? order.submittedDate.toString() : ''
       date = DateTime.fromFormat(submittedDate,'d MMM yyyy, HH:mm').toMillis()
     }
       if(date >= DateTime.fromJSDate(startDate).toMillis() && 
       date <= DateTime.fromJSDate(endDate).toMillis() ){
         filteredresult.push(order)
       }
     });
    }else{
      filteredresult = reorderedData
    }


    //Filter by column filters
    let resultForCache :any[] = filteredresult ;
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

const jsonify = (obj: any) => {
  return obj ? JSON.parse(JSON.stringify(obj)) : null
}

const getSearchParamsAsString = (search) =>{
  const filters = jsonify(search)
  delete filters['sortBy']
  delete filters['sortOrder']

  return JSON.stringify(filters)
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
      { name: "Completed", value: 4, },
      { name: "Submitted", value: 2, },
      { name: "Cancelled", value: 3, },
      { name: "Draft", value: 1, },
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
      const order = orderType === 'success' ||  state.isCancel === true ? state.successfullReorder : state.selectedOrder

      return flattenColors(order?.colors)
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
    },
    async setOrderInStore(result: any) {
      let details = JSON.parse(JSON.stringify(result));
      this.successfullReorder = details;
    },
    async getOrderById(reorderId: any) {
      /* 1.Reset previously loaded order
         2.SGS | Photon | Cart?
         3.Fetch / load order object with direct props
         4.Fetch / load additional details - shirttail, barcode, len etc
         5.Decorate for display
         6.Prepare options for platetype dropdown in Reorder Step */
      this.loading.order = true
      this.selectedOrder = null
      this.checkout = { expectedDate: null, purchaseOrder: null, expectedTime: null, notes: null, }

      if (reorderId) {
        const isPhotonOrder = !isNaN(parseFloat(reorderId)) && isFinite(reorderId)
        if (isPhotonOrder) {
          const cartStore = useCartStore()
          const order = cartStore.cartOrders.find((order: any) => order.id === reorderId)
          const isCartOrder = !!order
          if (isCartOrder) { // Photon order loaded from cart
            const plateTypes = await order?.plateTypes?.length ? mapPlateTypes(order) : mapColorPlateTypes(order.colors)
            this.options.plateTypeDescription = plateTypes.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = order
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            this.mapColorAndCustomerDetailsToOrder(this.selectedOrder, statusId, plateTypes);
            await this.getBarcodeAndShirtailForPhotonOrder(order)
          } else { // Photon order loaded from dashboard
            const photonOrder = this.orders.find((order: any) => order.sgsId === reorderId)
            const photonOrderDetails = jsonify(photonOrder ? await ReorderService.getPhotonReorderDetails(photonOrder?.id) : null)
            const details = { ...photonOrder, ...photonOrderDetails }
            const plateTypes = await mapColorPlateTypes(details?.colors)
            this.options.plateTypeDescription = plateTypes?.filter((plateType: any) => plateType.value !== 256)
            this.selectedOrder = details
            const statusId = this.selectedOrder ? this.selectedOrder?.statusId : 1
            if (statusId && plateTypes.length)
              this.mapColorAndCustomerDetailsToOrder(details, statusId, plateTypes)
            await this.getBarcodeAndShirtailForPhotonOrder(photonOrder)            
          }
        } else { // MySGS Order loaded from dashboard
          this.selectedOrder = this.orders.find( (order: any) => order.sgsId === reorderId );
          let details = jsonify(await ReorderService.getOrderDetails(reorderId))
          const plateTypes = await mapPlateTypes(details)
          this.options.plateTypeDescription = plateTypes?.filter((plateType: any) => plateType.value !== 256)
          this.selectedOrder = this.selectedOrder || {}
          this.selectedOrder = { ...this.selectedOrder, ...mapSgsOrderDetail(details) }
          this.mapColorAndCustomerDetailsToOrder(details, (this.selectedOrder as any)["statusId"], plateTypes);
        }
      }

      this.loading.order = false;
      return this.selectedOrder;
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
      /* If its is free text search then Pagination, Sorting, Filtering has to from stored data instead of API Call
        And Status should be completed (4) */
      if (
        this.textSearchData.query != '' &&
        this.textSearchData.query === getSearchParamsAsString(filters) && filters.status === 4
      ) {
        
        console.log('Showing result from Local Store');
       const reorderedData =  handleSortPagination(this.textSearchData.data.reorderedData , filters,this.pageState, filterStore)
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

        if (filters.status === 4) {
          console.log('Saving Search Result in Local Store',filters);
          this.textSearchData.query =getSearchParamsAsString(filters);
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

          const reorderedData =  handleSortPagination(this.textSearchData.data.reorderedData , filters,this.pageState)
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

          if('reorderedData' in result && Array.isArray(result.reorderedData) && result.reorderedData.length > 0 ){
              const reorderedData =  handleSortPagination(result.reorderedData , filters,this.pageState)
              result =  {
                reorderedData : reorderedData,
                totalRecords : result.reorderedData.length
              }
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
      this.selectedOrder = { ...this.selectedOrder, ...mapPhotonOrderDetail(shirttailDetails, barcodeDetails) }
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
      this.filters = newFilterProps()
      filterStore.state.brandNameFilter = null;
      filterStore.state.descriptionFilter = null;
      filterStore.state.packTypeFilter = null;
      filterStore.state.sortFields = null;
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
      const { isValid, hasEmptyPlateDescription, hasMixed, hasUniquePlates } = validation(colour)
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
    reorder(order: any) {
      router.push(`/dashboard/${order.sgsId}`);
    },
    async cancelOrder(orderId: number, isActive: boolean) {
         return await ReorderService.cancelOrder(orderId, isActive);
    },
    getSearchHistory(history: any) {
      this.searchHistory = [...history];
    },
    mapColorAndCustomerDetailsToOrder(details: any, statusId: number, plateTypes: any[]) {
      const colors = Array.from(details && details?.colors || [])
      this.selectedOrder.colors = colorDecorator(colors, plateTypes)
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
