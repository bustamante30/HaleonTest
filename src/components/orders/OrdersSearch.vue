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

const items = computed(() => [])

const isFiltersVisible = ref(false)

function search() {
}

function toggleFilters() {
  isFiltersVisible.value = !isFiltersVisible.value
}
</script>

<template lang="pug">
.orders-search
  .search
    prime-auto-complete(placeholder="Search: Enter upto 5 terms .." v-model="value" :suggestions="items" @complete="search")
    span.separator
    sgs-button.sm(label="Advanced Search" icon="filter_list" @click="toggleFilters")
  .filters(v-if="isFiltersVisible")
    sgs-mask(@click="toggleFilters")
    advanced-search(:sections="config.sections" :filters="filters")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-search
  +flex($h: right)
  width: 40rem
  .search
    +flex
    flex: 1
</style>
