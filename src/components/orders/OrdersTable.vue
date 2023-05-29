<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { DateTime } from 'luxon'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import FilterTokens from '@/components/ui/FilterTokens.vue'

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

</script>

<template lang="pug">
data-table.p-datatable-sm.orders-table(:value="data" scrollable scrollHeight="flex" paginator :rows="30")
  template(v-if="filters && filters.length" #header)
    header
      filter-tokens(:tokens="filters")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" )
  column(v-if="config.actions" :headerStyle="stylify(5)" :bodyStyle="stylify(5)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.orders-table
  header
    +flex-fill
</style>
