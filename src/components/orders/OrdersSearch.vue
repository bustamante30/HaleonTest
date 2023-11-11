<template lang="pug">
.orders-search(:class="{ focused: isSearchFocused }")
  .search
    .input
      prime-auto-complete.search-input.free-text(
v-model="searchedValue" :suggestions="filteredSuggestions" input-id='keyword'
      complete-on-focus :loading="false" :placeholder="placeholder" @keyup.enter="keywordSearch($event)" @focus="handleFocus" @blur="handleBlur"
      @item-select="keywordSearch")
      span.material-icons.outline.search-icon(@click="keywordSearch({query:searchedValue.value})") search
    sgs-button#advanced-search.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    advanced-search(:sections="config.sections" :filters="filters" :printer-name="printerName" @close="isFiltersVisible = false" @search="search")
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AdvancedSearch from "@/components/orders/AdvancedSearch.vue";
import { useSearchhistoryStore } from "@/stores/searchHistory";
import { debounce } from "lodash";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import * as Constants from "@/services/Constants";

const props = defineProps({
  config: {
    type: Object,
    default: () => {
      [];
    },
  },
  filters: {
    type: Object,
    default: () => null,
  },
  value: {
    type: String,
    default: null,
  },
  userType: {
    type: String,
    default: "",
  },
});
const isExternalUser = props.userType == "EXT";
const authb2cStore = useB2CAuthStore();
const authStore = useAuthStore();

const printerName = computed(() =>
  authb2cStore.currentB2CUser.isLoggedIn
    ? authb2cStore.currentB2CUser.printerName
    : "",
);
const emit = defineEmits(["search", "searchkeyword"]);
const searchhistoryStore = useSearchhistoryStore();
const searchHistory = computed(() => searchhistoryStore.searchHistory);
const filteredSuggestions = ref([]);
const searchedValue = ref();
const notificationsStore = useNotificationsStore();
const placeholder = computed(() =>
  isExternalUser.value
    ? "Search by item code, barcode, SGS reference number..."
    : "Search by printer, code, reference number...",
);

const isFiltersVisible = ref(false);
const loadingSuggestions = ref(false);

const isSearchFocused = ref(false);

onMounted(async () => {
  await searchhistoryStore.getSearchField();
});
async function handleFocus() {
  isSearchFocused.value = true;
  let userId;
  if (authStore.currentUser.isLoggedIn) {
    userId = authStore.currentUser.userId;
  }
  if (authb2cStore.currentB2CUser.isLoggedIn) {
    userId = authb2cStore.currentB2CUser.userId;
  }
  if (userId) {
    await searchhistoryStore.getSearchHistory(userId, false);
  }
  filteredSuggestions.value = searchHistory.value.map((x) => x.value);
}

function handleBlur() {
  isSearchFocused.value = false;
}

const keywordSearch = debounce(async (event) => {
  loadingSuggestions.value = false;
  event.query =
    searchedValue.value != null && !!searchedValue.value
      ? searchedValue.value
      : "";
  isFiltersVisible.value = false;
  if (
    (event.query && event.query !== "") ||
    (event.value && event.value !== "")
  ) {
    event.query = event.query ? event.query : event.value;
    if (validateSearch(event?.query)) {
      //should be a non blocking add history call
      searchhistoryStore.setKeywordSearchHistory(event?.query, false);
      emit("searchkeyword", event);
      // removing focus and value from search filed
      searchedValue.value = "";
      document.getElementById("keyword").blur();
    } else {
      notificationsStore.addNotification(
        Constants.Error,
        Constants.KEYWORD_INVALID_TYPE,
        { severity: "error", position: "top-right" },
      );
    }
  }
}, 350);

async function search(filters) {
  isFiltersVisible.value = false;
  emit("search", filters);
}

const validateSearch = (text) => {
  // Allowed chars are - Alpha numeric , given special chars and spaces
  // eslint-disable-next-line no-useless-escape
  const regex = /^[-_\/#.,+&():;<>\)\"a-zA-Z0-9\s]+$/;
  return regex.test(text);
};

function toggleFilters() {
  searchedValue.value = "";
  isFiltersVisible.value = !isFiltersVisible.value;
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-search
  +flex($h: right)
  width: 35rem
  transition: width 0.2s ease-out
  &.focused
    width: 35rem
  .search
    +flex
    flex: 1
    gap: $s50
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
.search-icon
  cursor: pointer
</style>
