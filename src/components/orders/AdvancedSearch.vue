<template lang="pug">
form.advanced-search(@submit.prevent="onSubmit")
  button.close-button(@click.prevent="closeForm" type="button")
    i.pi.pi-times
  sgs-scrollpanel
    template(#header)
      header
        h3 Advanced Search
    p.hint(v-if="user.isExternal==false") Enter at least Printer Name, Printer Location and 1 field
    p.hint(v-if="user.isExternal==true") Enter at least Printer location and 1 field
    .error-message(v-if="showError") {{ error }}
    template(#subheader)
    sgs-panel(v-if="formattedDates && formattedDates.length" :header="`Recent Searches [${formattedDates.length}]`")
      ul.recent-searches
        li(v-for="item in formattedDates")
          a(@click="handleDateClick(item.id)") {{ item.date }}
    .form-fields(v-if="advancedFilters")
      .field-group(v-for="section in sections")
        h4(v-if="section.label") {{ section.label }}
        .f(v-for="filter in section.filters")
          label(v-if="filter.label") {{ filter.label }}
          prime-dropdown.sm(v-if="filter.type === 'printerLoc'" v-model="advancedFilters[filter.name]" name="printerLoc" :inputId="printerLoc" :options="printerLocations" appendTo="body" optionLabel="label" optionValue="value" :value="advancedFilters[filter.name]?.type || 'SEL'")
          prime-calendar(v-else-if="filter.type === 'daterange'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" selectionMode="range" appendTo="body")
          prime-auto-complete(v-else-if="filter.type === 'printerSuggester'" v-model="advancedFilters[filter.name]" :name="filter.name" :suggestions="printerResults" completeOnFocus=true appendTo="body" @complete="searchPrinter($event)" :disabled="user.isExternal == true" emptyMessage="No results found" @item-select="searchPrinterSites()" )
          prime-dropdown.sm(v-else-if="filter.type === 'printerSiteSuggester'"  v-model="advancedFilters[filter.name]" :name="filter.name" :options="printerSiteResults.length ? printerSiteResults : [advancedFilters[filter.name]]" emptyMessage="No results found" )
          prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
    template(#footer)
      footer
        .secondaryactions
        .actions
          sgs-button.default(label="Reset" @click.prevent="reset")
          sgs-button(label="Search" type="submit")
</template>
  
<script lang="ts" setup>
import { type Ref, ref, onBeforeMount, computed, watch } from "vue";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import SuggesterService from "@/services/SuggesterService";
import { useSearchhistoryStore } from "@/stores/searchHistory";
import dayjs from 'dayjs';
import { keysIn } from 'lodash'
import { useOrdersStore } from "@/stores/orders";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  filters: {
    type: Object,
    default: () => { },
  },
  printerName: {
    type: String,
    default: "" 
  }
});

const user = { isExternal: props.printerName.length>0 }
const searchhistoryStore = useSearchhistoryStore()
const ordersStore = useOrdersStore()
let formattedDates: Ref<{ id: any; date: string; }[]> = ref([])

const emit = defineEmits(["reset", "search","resetAdvancedSearchVisible"]);

const printerResults: Ref<string[]> = ref([])
const printerSiteResults: Ref<string[]> = ref([])
const imageCarrierCodeTypes = ref([
  { label: "UPC Code", value: "UPC" },
  { label: "QR Code", value: "QR" },
  { label: "EAN Code", value: "EAN" },
  { label: "Data Matrix Code", value: "DATA_MATRIX" },
]);


const printerLocations = ref([
  { label: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)", value: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)" },
  { label: "Arizona", value: "AZ" },
  { label: "California", value: "CA" },
  { label: "Georgia", value: "GA" },
  { label: "Iowa", value: "IA" },
]);

let printerLoc = ref("AL");

const error = ref("");
const showError = ref(false);
let advancedFilters: Ref<any> = ref({});
const searchDate = computed(() => searchhistoryStore.searchDate)
const searchFieldReference = computed(() => (searchhistoryStore.searchFieldReference))

const closeForm = () => {
  const form = document.querySelector(".advanced-search") as HTMLFormElement;
  if (form) {
    form.style.display = "none";
  }
  emit("resetAdvancedSearchVisible", advancedFilters.value);
};

onBeforeMount(async () => {
  ordersStore.resetFilters();
  (advancedFilters as any).value = { ...(props.filters) };
  if(props.printerName.length>0){
    advancedFilters.value["printerName"] = props.printerName;
    searchPrinterSites();
  }
  await searchhistoryStore.getSearchDate(true).then(() => { formatDate() });
  await searchhistoryStore.getSearchField();
});

watch(() => props.filters, (value) => {
  (advancedFilters as any).value = { ...(value) };
})

async function formatDate() {
  if (searchDate.value && searchDate.value.length > 0) {
    searchDate.value.forEach((data) => {
      const localDate = dayjs.utc((data as any).timestamp).local();
      const formattedLocalDate = localDate.format('ddd, MMM D, YYYY h:mm:ss A');
      return formattedDates.value.push({ id: (data as any).userId, date: formattedLocalDate});
    })
  }
}

async function handleDateClick(dateRefId: number): Promise<void> {
  const advanceFilterData = advancedFilters.value as object
  reset()
  await searchhistoryStore.getSearchField()
  await searchhistoryStore.getSearchHistory(dateRefId, true)
  const columnNames = keysIn(advanceFilterData)
  if (searchFieldReference.value.length > 0) {
    searchFieldReference.value.forEach((searchReference) => {
      if (columnNames.includes((searchReference as any).fieldName)) {
        const searchStore = searchhistoryStore.searchHistory.find(x => parseInt((x as any).searchFieldId) === parseInt((searchReference as any).id));
        if (searchStore) {
          if ((searchReference as any).fieldName === 'startDate') {
            const dates = ((searchStore as any).value).split(',')
            const formattedDates = dates.map((dateString: any) => {
              return new Date(Date.parse(dateString));
            });
            (advancedFilters.value as any)[(searchReference as any).fieldName] = [...formattedDates];
          } else {
            (advancedFilters.value as any)[(searchReference as any).fieldName] = (searchStore as any).value;
          }
        }
      }
    })
  }
  
}


function reset() {
  advancedFilters.value["itemNumber"] = null;
  advancedFilters.value["orderDate"] = [];
  advancedFilters.value["printerName"] = props.printerName.length>0? props.printerName : null;
  advancedFilters.value["printerSite"] = null;
  advancedFilters.value["printerReference"] = null;
  advancedFilters.value["poNumber"] = null;
  advancedFilters.value["barcodeNumber"] = null;
  advancedFilters.value["sgsReferenceNumberList"] = null;
  advancedFilters.value["imageCarrierId"] = null;
  advancedFilters.value["imageCarrierCode"] = null;
  advancedFilters.value["imageCarrierCode"] = null;
  advancedFilters.value["printerPlateCode"] = null;
  advancedFilters.value["startDate"] = [];
  searchPrinterSites()
  ordersStore.resetFilters()
}

async function search(advancedSearchParameters?: any) {
  await searchhistoryStore.setSearchHistory(advancedSearchParameters, true)
  emit("search", advancedSearchParameters);
}

async function searchPrinter(value?: any) {
  if (value.query && value.query.length > 1) {
    printerResults.value = await SuggesterService.getPrinterList(value.query)
  }
}
async function searchPrinterSites() {
  if (advancedFilters.value?.printerName){
    printerSiteResults.value = await SuggesterService.getPrinterSiteList(advancedFilters.value?.printerName, '')
  }

}

function onSubmit() {
  const validationErrors = validateForm();
  if (validationErrors) {
    console.log(validationErrors)
    error.value = validationErrors;
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 3000);
    return;
  }

  search(advancedFilters.value)
  closeForm()
}

function validateForm() {

  if (!advancedFilters.value?.printerName) {
    return "You must select a printer.";
  }
  if (advancedFilters.value?.printerSite == null) {
    return "You must select a Shipping location.";
  }

  const errorMessage =
    "You must enter information into at least 1 field. Printer Name and Location must have an entry";
  const fields = Object.keys(advancedFilters.value);
  const additionalFields = fields.filter(
    (field) => field !== "printerName" && field !== "printerSite" && field !== "status"
  );
  for (const field of additionalFields) {
    const value = (advancedFilters.value as any)[field];
    if (
      value != undefined &&
      value != "" &&
      value != null &&
      value?.type != "SEL"
    ) {
      return null;
    }
  }

  return errorMessage;
}
</script>
  
<style lang="sass" scoped>
  @import "@/assets/styles/includes"
  
  .advanced-search
    +fixed-e
    +container
    width: 30rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    padding: $s
    z-index: $z-mask + 1
    background: #f6f6f6
    .form-fields
      padding: $s 0
      .field-group
        background: white
        padding: $s
        margin: 0 $s $s 0
        h4
          margin-top: 0
    .f
      padding: $s25
      > label
        display: block
        margin-bottom: $s25
      > .input
        width: 100%
      .code
        width: 10rem
    .fields
      +flex
      gap: $s
  .close-button
    position: absolute
    top: $s
    right: $s
    background: none
    border: none
    cursor: pointer
    outline: none
  
  .error-message
    margin-top: $s
    padding: $s
    background-color: rgba(255, 0, 0, 0.2)
    color: #800000
    position: relative
  
  .error-message p 
    margin: 0
  
  .error-message button.close-button 
    position: absolute
    top: 50%
    right: $s
    transform: translateY(-50%)
    background: none
    border: none
    cursor: pointer
    outline: none
  
  
  @keyframes fadeOut
    0%
      opacity: 1
    90%
      opacity: 1
    100%
      opacity: 0
.actions
  width: 100%

ul.recent-searches
  background: #fff
  +reset-space
  padding: $s50 0
  li
    padding: $s25 $s
    font-size: 0.9rem
  </style>
  