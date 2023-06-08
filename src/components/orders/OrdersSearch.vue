<script setup>
import { computed, ref } from 'vue'
import AdvancedSearch from '@/components/orders/AdvancedSearch.vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => { sections: [] }
  },
  filters: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['search'])

const items = computed(() => [])

const isFiltersVisible = ref(false)

function search(filters) {
  isFiltersVisible.value = false
  emit('search', filters)
}

function toggleFilters() {
  isFiltersVisible.value = !isFiltersVisible.value
}
</script>

<template lang="pug">
.orders-search
  .search
    .input
      prime-auto-complete.search-input(placeholder="Search by Brand, Product, Printer ..." v-model="value" :suggestions="items" @complete="search")
      span.material-icons.outline search
    span.separator
    sgs-button.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    sgs-mask(@click="toggleFilters")
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
