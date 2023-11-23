<!-- eslint-disable vue/no-v-model-argument -->
<!-- eslint-disable vue/no-template-shadow -->
<!-- eslint-disable vue/component-name-in-template-casing -->
<template lang="pug">
.orders-table
  data-table.p-datatable-sm(
      v-model:first="current"
      v-model:filters="columnFilters"
      :value="data"
      paginator
      responsive-layout="scroll"
      :rows="10"
      class="small-icons frozen-columns"
      filter-display="menu"
      :global-filter-fields="['brandName','description', 'packType', 'orderDate']"
      :loading="loading"
      :total-records="totalRecords"
      :lazy="true"
      scrollable
      scroll-height="flex"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      @sort="sortColumn"
      @page="onPage($event)"
    )
      template(#empty)
        div No records found.
      template(#loading)
        sgs-spinner.spinner(v-if="loading")
      //- Add to cart Selection column
      Column(
        v-if="showMultipleSelection"
        field="selected"
        header=""
        class="frozen-column"
        :header-style="{ width: `50px`, flex: 'none' }"
        :body-style="{ width: `50px`, flex: 'none' }"
      )
        template(#header)
          div.headerAddToCart
            Button.centered(
              type="button"
              label="Add"
              icon="pi pi-shopping-cart"
              class="custom-button"
              severity="secondary"
              @click="emit('addMultipleToCart', data)"
            )
        template(#body="{ data }")
          div.centered
            prime-checkbox.square(v-model="data.selected" :binary="true")
        
      //- ThumbNail column
      Column(
        field="thumbNailPath"
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
        filter-field="brandName"
        freeze="left"
        :sortable="true"
        :header-style="stylify(config.cols[1].width)"
        :body-style="stylify(config.cols[1].width)"
        :show-filter-match-modes="false"
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
          Button#filter-brand-name-clear(
            type="button"
            icon="pi pi-times"
            class="custom-button"
            severity="secondary"
            @click="clearFilter('brandName', filterModel)"
          )
        template(#filterapply="{ filterModel }")
          Button#filter-brand-name-apply(
            type="button"
            icon="pi pi-check"
            class="custom-button"
            severity="success"
            @click="customFilter('brandName', filterModel)"
          )
      
      //- Product Description column with contains filter
      Column(
        field="description"
        header="Product Description"
        filter-field="description"
        freeze="left"
        :sortable="true"
        :header-style="{ maxWidth: `300px`, flex: 'none' }"
        :body-style="{ maxWidth: `300px`, flex: 'none' }"
        :show-filter-match-modes="false"
      )
        template(#body="{ data }")
          table-cell(:config="config.cols[2]" :data="data" @ordervalidation ="handleOrderValidation")
        template(#filter="{ filterModel }")
          prime-inputtext.input(
            v-model="filterModel.value"
            type="text"
            class="custom-button"
            placeholder="Search by Description"
          )
        template(#filterclear="{ filterModel }")
          Button#filter-description-clear(
            type="button"
            icon="pi pi-times"
            class="custom-button"
            severity="secondary"
            @click="clearFilter('description', filterModel)"
          )
        template(#filterapply="{ filterModel }")
          Button#filter-description-apply(
            type="button"
            icon="pi pi-check"
            class="custom-button"
            severity="success"
            @click="customFilter('description', filterModel)"
          )
      
      //- Order Date column with date range filter
      Column(
        field="orderDate"
        sort-field="OrderDate"
        header="Order Date"
        :sortable="true"
        filter-field="orderDate"
        :header-style="stylify(config.cols[3].width)"
        :body-style="stylify(config.cols[3].width)"
        :show-filter-match-modes="false"
      )
        template(#body="{ data }")
          table-cell(:config="config.cols[3]" :data="data")

      //- Product Weight column
      Column(
        field="productWeight"
        header="Product Weight"
        :sortable="true"
        :header-style="stylify(config.cols[4].width)"
        :body-style="stylify(config.cols[4].width)"
      )
        template(#body="{ data }")
          table-cell(:config="config.cols[4]" :data="data")
      
      //- Item Code column
      Column(
        field="itemCode"
        header="Item Code"
        :sortable="true"
        :header-style="stylify(config.cols[5].width)"
        :body-style="stylify(config.cols[5].width)"
      )
        template(#body="{ data }")
          table-cell(:config="config.cols[5]" :data="data")
      
      //- Printer Name column
      Column(
        field="printerName"
        header="Printer Name"
        :sortable="true"
        :header-style="stylify(config.cols[6].width)"
        :body-style="stylify(config.cols[6].width)"
      )
        template(#body="{ data }")
          table-cell(:config="config.cols[6]" :data="data")
      
      //- PackType column
      Column(
        field="packType"
        header="PackType"
        filter-field="packType"
        :sortable="true"
        :header-style="stylify(config.cols[8].width)"
        :body-style="stylify(config.cols[8].width)"
        :show-filter-match-modes="false"
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
          Button#filter-packtype-clear(
            type="button"
            icon="pi pi-times"
            class="custom-button"
            severity="secondary"
            @click="clearFilter('packType', filterModel)"
          )
        template(#filterapply="{ filterModel }")
          Button#filter-packtype-apply(
            type="button"
            icon="pi pi-check"
            class="custom-button"
            severity="success"
            @click="customFilter('packType', filterModel)"
          )

      //- My SGS # column
      Column(
        field="mySgsNumber"
        :header="setSgsNumberHeader()"
        :sortable="true"
        :header-style="stylify(config.cols[9].width)"
        :body-style="stylify(config.cols[9].width)"
      )
        template(#body="{ data }")
          table-cell( :config="config.cols[9]" :data="data")
          //- Action column
      Column(
        field="actions"
        width="6rem"
      )
        template(#body="{ data }")
          table-actions(:actions="config.actions(data, userType, role)" :data="data" @action="handleAction" )
</template>

<!-- eslint-disable no-undef --><!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TableActions from "@/components/ui/TableActions.vue";
import TableCell from "@/components/ui/TableCell.vue";
import { FilterMatchMode } from "primevue/api";
import Button from "primevue/button";
import filterStore from "@/stores/filterStore";
import { useOrdersStore } from "@/stores/orders";
import { orderStatusLabels } from "@/data/config/keylabelpairconfig";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({ cols: [] }),
  },
  showMultipleSelection: {
    type: Boolean,
    default: () => false,
  },
  loading: {
    type: Boolean,
    default: () => true,
  },
  currentPage: {
    type: Object,
    default: () => {
      0;
    },
  },
  status: {
    type: Object,
    default: () => {
      4;
    },
  },
  userType: {
    type: String,
    default: () => "INT",
  },
  role: {
    type: String,
    default: () => "",
  },
});
const totalRecords = computed(() => orderStore.totalRecords);
let selected = ref();
const emit = defineEmits([
  "deleteFilter",
  "add",
  "reorder",
  "cancel",
  "audit",
  "addMultipleToCart",
  "ordervalidation",
]);
const current = ref(0);

function stylify(width: any) {
  return width
    ? { width: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}

onMounted(async () => {
  for (const [, value] of orderStatusLabels) {
    dropdownOptions.value.push(value.label);
  }
});
watch(
  () => props.currentPage,
  (newValue) => {
    current.value = newValue.value;
  },
);
watch(selected, (value) => {
  selected = value;
});

const orderStore = useOrdersStore();
const dropdownOptions = ref<string[]>([]);
const columnFilters = ref({
  brandName: { value: "", matchMode: FilterMatchMode.CONTAINS },
  description: { value: "", matchMode: FilterMatchMode.CONTAINS },
  orderDate: { value: "", matchMode: FilterMatchMode.BETWEEN },
  packType: { value: "", matchMode: FilterMatchMode.CONTAINS },
});

const mutationMap: { [key: string]: string } = {
  brandName: "setBrandNameFilter",
  description: "setDescriptionFilter",
  orderDate: "setOrderStartDateFilter",
  packType: "setPackTypeFilter",
};

const clearFilter = async (fieldName: string, filterModel: any) => {
  filterModel.value = null;
  // eslint-disable-next-line no-prototype-builtins
  if (mutationMap.hasOwnProperty(fieldName)) {
    const mutationName = mutationMap[fieldName];
    filterStore.commit(mutationName, null);
  }
  orderStore.setFilters(orderStore.filters);
};

function getFormattedValue(
  value: string | null,
  matchMode: string,
): string | null {
  if (value !== null && value !== undefined && value !== "") {
    return matchMode === FilterMatchMode.CONTAINS ? `%${value}%` : value;
  }
  return null;
}

async function customFilter(
  field: string,
  filterModel: any,
  filterMatchMode: string,
) {
  const fieldName = field as keyof typeof columnFilters.value;
  // eslint-disable-next-line no-prototype-builtins
  if (mutationMap.hasOwnProperty(fieldName)) {
    columnFilters.value[fieldName] = {
      value: getFormattedValue(filterModel.value, filterMatchMode),
      matchMode: filterMatchMode,
    } as any;
    const mutation = mutationMap[fieldName];
    filterStore.commit(mutation, columnFilters.value[fieldName].value);
  }
  orderStore.setFilters(orderStore.filters);
}

const sortColumn = async (event: any) => {
  const { sortField, sortOrder } = event;
  const order = sortOrder === 1 ? true : false;
  sortField.replace("-", "");
  const sortedField = sortField.replace("-", "");
  orderStore.pageState.page = 1;
  orderStore.filters.sortBy = sortedField;
  orderStore.filters.sortOrder = order;
  orderStore.setFilters(orderStore.filters);
};

function handleAction(action: any) {
  emit(action.event, action.data);
}
function onPage(event: any) {
  orderStore.pageState.page = event.page + 1;
  orderStore.setFilters(orderStore.filters);
}
function setSgsNumberHeader() {
  if (props.status && props.status.value == 4) return "SGS Ref #";
  else return "Order #";
}

function handleOrderValidation(data: any) {
  emit("ordervalidation", data);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-table
  +container

.orders-table
  header
    +flex-fill
.global-custom-button
    width: 100px
    height: 30px

.calendar-wrapper
    position: relatives
    z-index: 1
.calendar-icon .p-calendar-button
    width: 5px

.custom-button
    width: 166px
    height: 30px

.my-custom-calendar
    width: 200px
    height: 30px
.centered
  +flex(center,center)
.headerAddToCart
  width: 70px
  display: flex
  justify-content: center
.spinning
  font-size: 3rem
  background-color: white
</style>
