<template lang="pug">
form.advanced-search(@submit.prevent="onSubmit")
  button.close-button(@click.prevent="closeForm")
    i.pi.pi-times
  sgs-scrollpanel
    template(#header)
      header
        h3 Advanced Search
    template(#subheader)
        p.hint(v-if="user.isExternal==false") Enter at least Printer Name, Printer Location and 1 field
        p.hint(v-if="user.isExternal==true") Enter at least Printer location and 1 field
        .error-message(v-if="showError") {{ error }}
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
          prime-auto-complete(v-else-if="filter.type === 'printerSuggester'" v-model="advancedFilters[filter.name]" :name="filter.name" :suggestions="printerResults" completeOnFocus=true appendTo="body" @complete="searchPrinter($event)" :disabled="user.isExternal == true" emptyMessage="No results found"  )
          prime-auto-complete(v-else-if="filter.type === 'printerSiteSuggester'" v-model="advancedFilters[filter.name]" :name="filter.name" :suggestions="printerSiteResults" completeOnFocus=true appendTo="body" @complete="searchPrinterSites($event)" emptyMessage="No results found" )
          prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
    template(#footer)
      footer
        .secondaryactions
        .actions
          sgs-button.default(label="Reset" @click.prevent="reset")
          sgs-button(label="Search" type="submit")
</template>
  
<script lang="ts" setup>
import { type Ref, ref, onBeforeMount, computed, onMounted, watch } from "vue";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import SuggesterService from "@/services/SuggesterService";
import type { SearchFieldDto } from "@/models/SearchFieldDto";
import { useSearchhistoryStore } from "@/stores/searchHistory";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import dayjs from 'dayjs';
import { DateTime } from 'luxon'
import { keysIn } from 'lodash'

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  filters: {
    type: Object,
    default: () => { },
  }
});

const user = { isExternal: false }
const searchhistoryStore = useSearchhistoryStore()
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
let formattedDates: { id: any; date: string; }[] = []

interface AdvancedFilters {
  itemNumber: string | null;
  startDate: string | null;
  printerName: string | null;
  printerSite: string | null;
  printerReference: string | null;
  poNumber: string | null;
  printerPlateCode: string | null;
  barcodeNumber: string | null;
  sgsReferenceNumberList: string | null;
  // Add more properties as needed
}

const emit = defineEmits(["search"]);

const advancedFilters = ref<AdvancedFilters>();
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
let searchField: SearchFieldDto;
const searchDate = computed(() => searchhistoryStore.searchDate)
const searchFieldReference = computed(() => (searchhistoryStore.searchFieldReference))

const closeForm = () => {
  const form = document.querySelector(".advanced-search") as HTMLFormElement;
  if (form) {
    form.style.display = "none";
  }
};

onBeforeMount(() => {
  searchhistoryStore.getSearchDate()
  advancedFilters.value = { ...(props.filters as AdvancedFilters) };
  formatDate()
});

watch(searchDate, async () => {
  if (searchhistoryStore.searchDate) {
    searchhistoryStore.getSearchField()
    await formatDate()
  }
});

async function formatDate() {
  formattedDates = []
  if (searchDate.value && searchDate.value.length > 0) {
    searchDate.value.forEach((data) => {
      formattedDates.push({ id: (data as any).userId, date: dayjs((data as any).TimeStamp).format('dddd, MMMM D, YYYY') });
    })
  }
}

async function handleDateClick(dateRefId: number): Promise<void> {
  clear()
  await searchhistoryStore.getSearchField()
  await searchhistoryStore.getSearchHistory(dateRefId)
  const columnNames = keysIn(advancedFilters.value as object)
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
  advancedFilters.value = { ...(props.filters as AdvancedFilters) };
  advancedFilters.value.sgsReferenceNumberList = null;
  advancedFilters.value.itemNumber = null;
  advancedFilters.value.barcodeNumber = null;
  advancedFilters.value.printerName = null;
  advancedFilters.value.printerPlateCode = null;
  advancedFilters.value.poNumber = null;
  advancedFilters.value.printerSite = null;
  advancedFilters.value.printerReference = null;
  advancedFilters.value.startDate = null;
  emit("search")
  closeForm()
}


function clear() {
  advancedFilters.value = { ...(props.filters as AdvancedFilters) };
  advancedFilters.value.sgsReferenceNumberList = null;
  advancedFilters.value.itemNumber = null;
  advancedFilters.value.barcodeNumber = null;
  advancedFilters.value.printerName = null;
  advancedFilters.value.printerPlateCode = null;
  advancedFilters.value.poNumber = null;
  advancedFilters.value.printerSite = null;
  advancedFilters.value.printerReference = null;
  advancedFilters.value.startDate = null;
}

// function search() {
//   emit("search", advancedFilters.value);
// }

function search(advancedSearchParameters?: any) {
  searchhistoryStore.setSearchHistory(advancedSearchParameters).then((res) => {
    console.log(res)
  })
  emit("search", advancedSearchParameters);
}

async function searchPrinter(value?: any) {
  if (value.query && value.query.length > 1) {
    printerResults.value = await SuggesterService.getPrinterList(value.query)
  }
}
async function searchPrinterSites(value?: any) {
  console.log(value)
  if (value.query && advancedFilters.value?.printerName)
    printerSiteResults.value = await SuggesterService.getPrinterSiteList(advancedFilters.value?.printerName, value.query)
}

function onSubmit() {
  console.log(advancedFilters.value)
  const validationErrors = validateForm();
  if (validationErrors) {
    console.log(validationErrors)
    error.value = validationErrors;
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 3000); // Adjust the time (in milliseconds) as needed
    return;
  }

  // Proceed with form submission or other actions
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
  //       const fields = Object.keys((advancedFilters.value as any)) 
  // console.log(fields)
  // for (const field  of fields) {
  //   const value = (advancedFilters.value as any)[field];
  const fields = Object.keys(advancedFilters.value);
  const additionalFields = fields.filter(
    (field) => field !== "printerName" && field !== "printerSite"
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
  