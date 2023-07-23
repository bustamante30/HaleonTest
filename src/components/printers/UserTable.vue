<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({ cols: [] })
  },
  className: {
    type: [String, Array],
    default: null
  }
})

const emit = defineEmits(['editUser'])

function stylify(width) {
  return width
    ? { width: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

function handleAction(action) {
  emit('editUser',{event: action.event, data: action.data})
}

</script>

<template lang="pug">
data-table.p-datatable-sm.user-table(:value="data" scrollable scrollHeight="flex" paginator :rows="30" :class="className")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" )
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data" @action="handleAction")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.user-table
  header
    +flex-fill
</style>
