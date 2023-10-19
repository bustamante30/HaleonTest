<template lang="pug">
.orders-search
  .search
    .input
      prime-auto-complete.search-input(v-model="value" placeholder="Search by Brand, Product, Printer ..." :suggestions="items" @complete="search")
      span.material-icons.outline search
    span.separator
    sgs-button#advanced-search-user.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    sgs-mask(@click="toggleFilters")
    advanced-search(:sections="config.sections" :filters="filters" @search="search")
</template>
<!-- eslint-disable no-undef -->
<script setup>
import AdvancedSearch from "@/components/orders/AdvancedSearch.vue";

defineProps({
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
});

const emit = defineEmits(["search"]);

const items = computed(() => []);

const isFiltersVisible = ref(false);

function search(filters) {
  isFiltersVisible.value = false;
  emit("search", filters);
}

function toggleFilters() {
  isFiltersVisible.value = !isFiltersVisible.value;
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-search
  +flex($h: right)
  width: 40rem
</style>
