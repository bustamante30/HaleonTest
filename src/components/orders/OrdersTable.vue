<script setup lang="ts">
import {ref, watch, reactive, onMounted, nextTick, getCurrentInstance } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { DateTime } from 'luxon'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import FilterTokens from '@/components/ui/FilterTokens.vue'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputText from "primevue/inputtext"
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import Button from 'primevue/button'
import filterStore from  '@/stores/filterStore'
import { useOrdersStore } from '@/stores/orders'
import { orderStatusLabels } from '@/data/config/keylabelpairconfig'


const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({ cols: [] })
  },
  filters: {
    type: Object,
    default: () => {}
  }
})

function stylify(width) {
  return width
    ? { width: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

// console.log("ColumnHeader:"+ config.cols);

onMounted(async () => {	
  for (const [, value] of  orderStatusLabels) {	
    dropdownOptions.value.push(value.label);	
  }	
});


const showTextbox = ref(false)
const orderStore = useOrdersStore()
const dropdownOptions = ref<string[]>([]);
const showStartDateCalendar = ref(false);
const showEndDateCalendar = ref(false);

const selectedStatusFilter = ref(null);	
const filters = ref({
  brandName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    productDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
    orderDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
    packType: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.IN },
});


const initFilters = () => {
  filters.value = { ...filters.value };
};

const mutationMap: { [key: string]: string } = {
  brandName: 'setBrandNameFilter',
  productDescription: 'setProductDescriptionFilter',
  orderDate: 'setOrderStartDateFilter',
  packType: 'setPackTypeFilter',
  status: 'setOrderStatusFilter',
};

const showCalendar = ref(false);
const sortFields = ref<string[]>([]);

const globalClearFilter = async () => {
  initFilters();
  filterStore.commit('setBrandNameFilter', null);
  filterStore.commit('setProductDescriptionFilter', null);
  filterStore.commit('setPackTypeFilter', null);
  filterStore.commit('setOrderStartDateFilter', null);
  filterStore.commit('setOrderEndDateFilter', null);
  filterStore.commit('setOrderStatusFilter', null);


  const response = await orderStore.getOrders();
};

function filterValue(fieldName: string, matchMode: FilterMatchMode): string | null {
  const value = filters.value[fieldName]?.value;
  if (value !== null && value !== undefined && value !== '') {
    return matchMode === FilterMatchMode.CONTAINS ? `%${value}%` : value;
  }
  return null;
}

function getFormattedValue(value: string | null, matchMode: FilterMatchMode): string | null {
  if (value !== null && value !== undefined && value !== '') {
    return matchMode === FilterMatchMode.CONTAINS ? `%${value}%` : value;
  }
  return null;
}

async function customFilter(field: string, filterModel: any, filterMatchMode: FilterMatchMode) {
  debugger;
  const fieldName = field as keyof typeof filters.value;
  if (fieldName === 'status') {
    let statusFilter = filterModel.value
    for (const [key, value] of orderStatusLabels) {
      if (value.label === filterModel.value) {
        console.log("StatusValue:"+ key);
        filterStore.commit('setOrderStatusFilter', key);
        break;
      }
    }
  }
  else if (mutationMap.hasOwnProperty(fieldName)) {
  filters.value[fieldName] = { value: getFormattedValue(filterModel.value, filterMatchMode), matchMode: filterMatchMode };
  console.log("customFilter:" + filters.value[fieldName].value);
  const mutation = mutationMap[fieldName];
  filterStore.commit(mutation, filters.value[fieldName].value);
  }
  console.log("filtersoreStatus" + filterStore.state.orderStatusFilter)
  orderStore.setFilters(filters);

  // orderStore.getOrders();
}

const clearFilter = async (fieldName:string,filterModel:any) => {	
  filterModel.value = null;
  if (mutationMap.hasOwnProperty(fieldName)) {
    const mutationName = mutationMap[fieldName];
    filterStore.commit(mutationName, null);
  }
   if (fieldName === 'orderDate') {
      filterStore.commit('setOrderEndDateFilter', null);

  } 
 orderStore.getOrders();
};

const sortColumn = async (event: any) => {
  const { sortField, sortOrder } = event;
  const order = sortOrder === 1 ? 'ascending' : 'descending';

  const sortFields = ref<string[]>([]);
  ///sortField = sortField.replace('-', '');
  const sortFieldPrefix = sortOrder === 1 ? '-' : '';
  const sortedField = `${sortFieldPrefix}${sortField}`;

  // Clear the existing sort field
  sortFields.value = [];
  sortFields.value.push(sortedField);
  console.log("SortColumn:" + sortFields.value[0]);
  const sortFieldsString = sortFields.value[0]; // Get the first (and only) value
  filterStore.commit('setSortFields', sortFieldsString);

  orderStore.setFilters(filters);
}

</script>

<template lang="pug">
data-table.p-datatable-sm.orders-table(
    :value="data"
    scrollable 
    scrollHeight="flex"
    :rows="props.rows"
    v-model:filters="filters"
    class="small-icons"
    filterDisplay="menu"
    @sort="sortColumn"
    :globalFilterFields="['brandName','description', 'packType', 'orderDate']"
    class="frozen-columns"
  )
    template(#empty)
      div No records found.
    template(#loading)
      div Loading data. Please wait.

    //- ThumbNail column
    Column(
      field="thumbNail"
      header="ThumbNail"
      freeze="left"
      class="frozen-column"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[0]" :data="data")
    
    //- Brand Name column with contains filter
    Column(
      field="brandName"
      header="Brand Name"
      filterField="brandName"
      freeze="left"
      :sortable="true"
      :headerStyle="stylify(config.cols[1].width)"
      :bodyStyle="stylify(config.cols[1].width)"
      :showFilterMatchModes="false"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[1]" :data="data")
      template(#filter="{ filterModel }")
        prime-inputtext.input(
          v-model="filterModel.value"
          type="text"
          class="custom-button"
          placeholder="Search by Brand"
        )
      template(#filterclear="{ filterModel }")
        Button(
          type="button"
          icon="pi pi-times"
          @click="clearFilter('brandName', filterModel)"
          class="custom-button"
          severity="secondary"
        )
      template(#filterapply="{ filterModel, filterCallback }")
        Button(
          type="button"
          icon="pi pi-check"
          @click="customFilter('brandName', filterModel)"
          class="custom-button"
          severity="success"
        )
    
    //- Product Description column with contains filter
    Column(
      field="description"
      header="Product Description"
      filterField="productDescription"
      freeze="left"
      :sortable="true"
      :headerStyle="stylify(config.cols[2].width)"
      :bodyStyle="stylify(config.cols[2].width)"
      :showFilterMatchModes="false"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[2]" :data="data")
      template(#filter="{ filterModel }")
        prime-inputtext.input(
          v-model="filterModel.value"
          type="text"
          class="custom-button"
          placeholder="Search by Description"
        )
      template(#filterclear="{ filterModel }")
        Button(
          type="button"
          icon="pi pi-times"
          @click="clearFilter('productDescription', filterModel)"
          class="custom-button"
          severity="secondary"
        )
      template(#filterapply="{ filterModel, filterCallback }")
        Button(
          type="button"
          icon="pi pi-check"
          @click="customFilter('productDescription', filterModel)"
          class="custom-button"
          severity="success"
        )
    
    //- Order Date column with date range filter
    Column(
      field="orderDate"
      sortField="OrderDate"
      header="Order Date"
      :sortable="true"
      filterField="orderDate"
      :headerStyle="stylify(config.cols[3].width)"
      :bodyStyle="stylify(config.cols[3].width)"
      :showFilterMatchModes="false"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[3]" :data="data")

    //- Product Weight column
    Column(
      field="productWeight"
      header="Product Weight"
      :sortable="true"
      :headerStyle="stylify(config.cols[4].width)"
      :bodyStyle="stylify(config.cols[4].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[4]" :data="data")
    
    //- Item Code column
    Column(
      field="itemCode"
      header="Item Code"
      :sortable="true"
      :headerStyle="stylify(config.cols[5].width)"
      :bodyStyle="stylify(config.cols[5].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[5]" :data="data")
    
    //- Printer Name column
    Column(
      field="printerName"
      header="Printer Name"
      :sortable="true"
      :headerStyle="stylify(config.cols[6].width)"
      :bodyStyle="stylify(config.cols[6].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[6]" :data="data")
    
    //- Printer Location column
    Column(
      field="printerLocation"
      header="Printer Location"
      :sortable="true"
      :headerStyle="stylify(config.cols[7].width)"
      :bodyStyle="stylify(config.cols[7].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[7]" :data="data")
    
    //- PackType column
    Column(
      field="packType"
      header="PackType"
      filterField="packType"
      :sortable="true"
      :headerStyle="stylify(config.cols[8].width)"
      :bodyStyle="stylify(config.cols[8].width)"
      :showFilterMatchModes="false"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[8]" :data="data")
      template(#filter="{ filterModel }")
        prime-inputtext.input(
          v-model="filterModel.value"
          type="text"
          class="custom-button"
          placeholder="Search by PackType"
        )
      template(#filterclear="{ filterModel }")
        Button(
          type="button"
          icon="pi pi-times"
          @click="clearFilter('packType', filterModel)"
          class="custom-button"
          severity="secondary"
        )
      template(#filterapply="{ filterModel, filterCallback }")
        Button(
          type="button"
          icon="pi pi-check"
          @click="customFilter('packType', filterModel)"
          class="custom-button"
          severity="success"
        )

    //- My SGS # column
    Column(
      field="mySgsNumber"
      header="My SGS #"
      :sortable="true"
      :headerStyle="stylify(config.cols[9].width)"
      :bodyStyle="stylify(config.cols[9].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[9]" :data="data")

    //- Status column
    Column(
      field="orderStatus"
      v-model="selectedStatusFilter"
      header="Status"
      type= 'badge'
      width= 7
      freeze= 'right'
      filterField="status"
      :sortable="true"
      :headerStyle="stylify(config.cols[10].width)"
      :bodyStyle="stylify(config.cols[10].width)"
      :showFilterMatchModes="false"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[10]" :data="data")
      template(v-slot:filter="{ filterModel }")
        Dropdown(
          v-model="filterModel.value"
          :options="dropdownOptions"
          placeholder="Select One"
          class="p-column-filter"
          showClear
        )
      template(#filterclear="{ filterModel }")
        Button(
          type="button"
          icon="pi pi-times"
          @click="clearFilter('status', filterModel)"
          class="custom-button"
          severity="secondary"
        )
      template(#filterapply="{ filterModel, filterCallback }")
        Button(
          type="button"
          icon="pi pi-check"
          class="custom-button"
          @click="customFilter('status', filterModel)"
          severity="success"
        )

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-table
  header
    +flex-fill
.global-custom-button
    width: 100px
    height: 30px

.calendar-wrapper
    position: relative
    z-index: 1
.calendar-icon .p-calendar-button 
    width: 5px
  
.custom-button
    width: 80px
    height: 30px
  
.my-custom-calendar
    width: 200px
    height: 30px
  
</style>
