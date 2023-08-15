<script setup>
import { computed, ref, } from "vue";
import AdvancedSearch from "@/components/orders/AdvancedSearch.vue";
import { useSearchhistoryStore } from "@/stores/searchHistory";
import { debounce } from "lodash";
import { useNotificationsStore } from '@/stores/notifications'
import { useB2CAuthStore } from "@/stores/b2cauth";
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      sections: [];
    },
  },
  filters: {
    type: Object,
    default: () => null,
  },
  value:{
    type:String,
    defulat:null
  }
});
const authb2cStore = useB2CAuthStore();
const printerName = computed(()=> authb2cStore.currentB2CUser.isLoggedIn? authb2cStore.currentB2CUser.printerName: "")
const emit = defineEmits(["search" ,"searchkeyword"]);
const searchhistoryStore = useSearchhistoryStore()
const searchDate = computed(() => searchhistoryStore.searchDate);
const searchHistory = computed(() => searchhistoryStore.searchHistory);
const filteredSuggestions = ref([]);
const searchedValue = ref();
const dateRefId = ref("");
const notificationsStore = useNotificationsStore()



const searchValue = computed(() => props.value);

const isFiltersVisible = ref(false);
const loadingSuggestions = ref(false);

async function handleFocus(item) {
  await searchhistoryStore.getSearchDate(false)
  await searchhistoryStore.getSearchField();
  dateRefId.value = searchDate.value?.[0]?.userId;
  if (dateRefId.value) {
    await searchhistoryStore.getSearchHistory(dateRefId.value, false)
  }
  filteredSuggestions.value = searchHistory.value.map(x => x.value)
} 

const keywordSearch =  debounce(async(event)=> {
  console.log('API from Search',event?.query)
  loadingSuggestions.value = false;
  isFiltersVisible.value = false;
  if ((event.query && event.query !== "") || (event.value &&event.value !== "")) {
    event.query = event.query? event.query : event.value
    if(validateSearch(event?.query)){
      console.log('API from Search',event?.query)
      //should be a non blocking add history call 
      searchhistoryStore.setKeywordSearchHistory(event?.query, false);
    emit("searchkeyword", event);
  }else{ 
    // Notify User
    notificationsStore.addNotification(
        `Error`,
        `Only the following special characters are allowed -, _, /, \, # , ., , +, &, (, ), " ",.  Please correct and try your search again)`,
        { severity: 'error', position: 'top-right' }
      );
  }
  }

},350)


async function search(filters) {
  isFiltersVisible.value = false;
  emit("search", filters);
}

async function addToHistory() {
  // loadingSuggestions.value = true;
  if (searchedValue.value) {
    console.log('API from addToHistory')
    await searchhistoryStore.setKeywordSearchHistory(searchedValue.value, false);
  } else {
    handleFocus(searchedValue.value)
  }
  loadingSuggestions.value = false;
}

const validateSearch = (text) =>{
  // Allowed chars are - Alpha numeric , given special chars and spaces 
    const regex = /^[-_\/#.,+&():;<>\)\"a-zA-Z0-9\s]+$/
    return regex.test(text)
}

function toggleFilters() {
  isFiltersVisible.value = !isFiltersVisible.value;
}
</script>

<template lang="pug">
.orders-search
  .search
    .input
      prime-auto-complete.search-input(v-model="searchedValue" :suggestions="filteredSuggestions" 
      @keyup.enter="keywordSearch($event)" @complete="keywordSearch" completeOnFocus forceSelection @focus="handleFocus" @item-select="keywordSearch"
      placeholder="Search by plate code, item code, UPC code..." :loading="loadingSuggestions")
      span.material-icons.outline search
    span.separator
    sgs-button.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    advanced-search(:sections="config.sections" :filters="filters" :printerName="printerName" @search="search")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-search
  +flex($h: right)
  width: 40rem
  .search
    +flex
    flex: 1
    .input
      flex: 1
      position: relative
      span.material-icons
        +absolute-w
        +flex(center, center)
        left: $s50
        font-size: 1.5rem
        opacity: 0.6
</style>

<style lang="sass">
@import "@/assets/styles/includes"

.search-input
  .p-autocomplete-input
    padding-left: $s3
    width: 100%
</style>
