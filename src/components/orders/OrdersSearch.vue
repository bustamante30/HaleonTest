<script setup>
import { computed, ref, onMounted, watch } from "vue";
import AdvancedSearch from "@/components/orders/AdvancedSearch.vue";
import { useSearchhistoryStore } from "@/stores/searchHistory";
import { debounce } from "lodash";

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
});

const emit = defineEmits(["search"]);
const searchhistoryStore = useSearchhistoryStore()
const searchDate = computed(() => searchhistoryStore.searchDate);
const searchHistory = computed(() => searchhistoryStore.searchHistory);
const filteredSuggestions = ref([]);
const searchedValue = ref();
const dateRefId = ref("");
const isFiltersVisible = ref(false);
const loadingSuggestions = ref(false);

onMounted(async () => {
  await searchhistoryStore.getSearchDate(false)
  await searchhistoryStore.getSearchField();
  dateRefId.value = searchDate.value?.[0]?.userId;
});

async function handleFocus(item) {
  if (dateRefId.value) {
    await searchhistoryStore.getSearchHistory(dateRefId.value, false)
  }
  filteredSuggestions.value = searchHistory.value.map(x => x.value)
}

async function search(filters) {
  isFiltersVisible.value = false;
  if (filters.query !== "") {
    emit("search", filters);
  } else {
    handleFocus(filters.query)
  }
}
async function addToHistory() {
  loadingSuggestions.value = true;
  if (searchedValue.value) {
    await searchhistoryStore.setKeywordSearchHistory(searchedValue.value, false);
  } else {
    handleFocus(searchedValue.value)
  }
  loadingSuggestions.value = false;
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
      @keyup.enter="addToHistory()" @complete="search" completeOnFocus forceSelection 
      placeholder="Search by plate code, item code, UPC code..." :loading="loadingSuggestions")
      span.material-icons.outline search
    span.separator
    sgs-button.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    advanced-search(:sections="config.sections" :filters="filters" @search="search")
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
