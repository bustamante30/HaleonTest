<script setup lang="ts">
import {ref, watch, reactive, onMounted, withDefaults, defineProps, nextTick, getCurrentInstance, defineEmits } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { DateTime } from 'luxon'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import FilterTokens from '@/components/ui/FilterTokens.vue'
import Calendar from 'primevue/calendar'
import InputText from "primevue/inputtext"
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import filterStore from  '@/stores/filterStore'


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


const selectedStatusFilter = ref(null);
const filters = ref({
  thumbNail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  brandName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  productDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
  orderDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
  productWeight: { value: null, matchMode: FilterMatchMode.IN },
  itemCode: { value: null, matchMode: FilterMatchMode.IN },
  printerName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  printerLocation: { value: null, matchMode: FilterMatchMode.CONTAINS },
  packType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  mySGS: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.IN }
});

function initFilters() {
  filters.value = {
    brandName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    productDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
    orderDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
    packType: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.IN },
  };
};

const mutationMap: { [key: string]: string } = {
  thumbNail: 'setThumbNailFilter',
  brandName: 'setBrandNameFilter',
  productDescription: 'setProductDescriptionFilter',
  orderDate: 'setOrderDateFilter',
  productWeight: 'setProductWeightFilter',
  itemCode: 'setItemCodeFilter',
  printerName: 'setPrinterNameFilter',
  printerLocation: 'setPrinterLocationFilter',
  packType: 'setPackTypeFilter',
  mySGS: 'setMySGSFilter',
  status: 'setStatusFilter',
};

const showCalendar = ref(false);

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
  const fieldName = field as keyof typeof filters.value;
  filters.value[fieldName] = { value: getFormattedValue(filterModel.value, filterMatchMode), matchMode: filterMatchMode };
  const mutation = mutationMap[fieldName];
  filterStore.commit(mutation, filters.value[fieldName].value);
  //await projectViewStore.fetchProjects();
}

async function clearFilter() {
  initFilters();
  for (const fieldName in filters.value) {
    const mutation = mutationMap[fieldName];
    filterStore.commit(mutation, null);
  }
  //await projectViewStore.fetchProjects();
}

async function sortColumn(sortField: string, sortOrder: number) {
  const sortFields = ref<string[]>([]);
  sortField = sortField.replace('-', '');
  const sortFieldPrefix = sortOrder === 1 ? '-' : '';
  const sortedField = `${sortFieldPrefix}${sortField}`;

  // Clear the existing sort field
  sortFields.value = [];
  sortFields.value.push(sortedField);

  const sortFieldsString = sortFields.value[0]; // Get the first (and only) value
  filterStore.commit('setSortFields', sortFieldsString);

  //await projectViewStore.fetchProjects();
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
    :globalFilterFields="['brandName','productDescription', 'packType', 'orderDate']"
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
      field="productDescription"
      header="Product Description"
      filterField="productDescription"
      freeze="left"
      :sortable="true"
      :headerStyle="stylify(config.cols[2].width)"
      :bodyStyle="stylify(config.cols[2].width)"
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
      field="projectView.orderDate"
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
      template(#filter="{ filterModel }")
        .filter-wrapper
          .input-container(:class="{'p-calendar-filter': showStartDateCalendar}")
            InputText(
              v-if="showTextbox"
              v-model="filterModel.startDate"
              id="start-date"
              :placeholder="showStartDateCalendar ? 'yyyy-mm-dd' : 'Search by Order Date'"
            )
            Calendar(
              v-model="filterModel.startDate"
              :showIcon="true"
              :showOnFocus="false"
              :showOtherMonths="false"
              :numberOfMonths="1"
              display="inline"
              :style="{ marginBottom: '10px' }"
              class="calendar-icon my-custom-calendar"
            )
        .input-container(:class="{'p-calendar-filter': showEndDateCalendar}")
            InputText(
              v-if="showTextbox"
              v-model="filterModel.endDate"
              id="end-date"
              :placeholder="showEndDateCalendar ? 'yyyy-mm-dd' : 'Search by Order Date'"
            )
            Calendar(
              v-model="filterModel.endDate"
              showIcon="true"
              :showOnFocus="false"
              :showOtherMonths="false"
              :numberOfMonths="1"
              class="calendar-icon my-custom-calendar"
            )
      template(#filterclear="{ filterModel }")
        Button(
          type="button"
          icon="pi pi-times"
          @click="clearFilter('orderDate', filterModel)"
          severity="secondary"
          class="custom-button"
          style="margin-right: 5px"
        )
      template(#filterapply="{ filterModel, filterCallback }")
        Button(
          type="button"
          icon="pi pi-check"
          @click="customFilter('orderDate', filterModel)"
          severity="success"
          class="custom-button"
          style="margin-left: 5px"
        )

    //- Product Weight column
    Column(
      field="projectView.productWeight"
      header="Product Weight"
      :sortable="true"
      :headerStyle="stylify(config.cols[4].width)"
      :bodyStyle="stylify(config.cols[4].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[4]" :data="data")
    
    //- Item Code column
    Column(
      field="projectView.itemCode"
      header="Item Code"
      :sortable="true"
      :headerStyle="stylify(config.cols[5].width)"
      :bodyStyle="stylify(config.cols[5].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[5]" :data="data")
    
    //- Printer Name column
    Column(
      field="projectView.printerName"
      header="Printer Name"
      :sortable="true"
      :headerStyle="stylify(config.cols[6].width)"
      :bodyStyle="stylify(config.cols[6].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[6]" :data="data")
    
    //- Printer Location column
    Column(
      field="projectView.printerLocation"
      header="Printer Location"
      :sortable="true"
      :headerStyle="stylify(config.cols[7].width)"
      :bodyStyle="stylify(config.cols[7].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[7]" :data="data")
    
    //- PackType column
    Column(
      field="projectView.packType"
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
      field="projectView.mySgsNumber"
      header="My SGS #"
      :sortable="true"
      :headerStyle="stylify(config.cols[9].width)"
      :bodyStyle="stylify(config.cols[9].width)"
    )
      template(#body="{ data }")
        table-cell(:config="config.cols[9]" :data="data")

    //- Status column
    Column(
      field="projectView.status"
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

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-table
  header
    +flex-fill
.global-custom-button
    width: 100px
    height: 30px
</style>
