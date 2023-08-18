<script setup>
import { ref, onBeforeMount, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { DateTime } from 'luxon'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import ColorsTablePlates from './ColorsTableExpandPlates.vue'

import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({ cols: [] })
  },
  isEditable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

const selected = ref([])
const expandedRows = ref([])

onBeforeMount(() => {
  // if (props.isEditable) selected.value = [...props.data]
})

function stylify(width) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    console.log(`selected colors ${colors && colors.length}`, colors.length, prevColors.length)
    const prevColorIds = prevColors.map(c => c.id)
    const colorIds = colors.map(c => c.id)
    // If color added sets = 1
    colors.forEach((color) => {
      const { id } = color
      if (!prevColorIds.includes(color.id)) {
        updateColor({ id, field: 'sets', value: 1 })
      }
    })
    // If color removed sets = 0
    prevColors.forEach((color) => {
      const { id } = color
      if (!colorIds.includes(color.id)) {
        updateColor({ id, field: 'sets', value: 0 })
      }
    })
  }
})

function updateColor({ id, field, value }) {
  emit('update', { id, field, value })
}

function addPlate(params) {
  ordersStore.addPlate(params)
}

function removePlate(params) {
  ordersStore.removePlate(params)

}

function updatePlate(params) {
  ordersStore.updatePlate(params)
}

</script>

<template lang="pug">
data-table.colors-table.p-datatable-sm(:value="data" v-model:selection="selected" v-model:expandedRows="expandedRows" scrollable scrollHeight="flex" :rows="30" dataKey="id")
  column(expander headerStyle="width: 3rem")
  column(v-if="isEditable" selectionMode="multiple" headerStyle="width: 3rem")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
  template(#expansion="{ data }")
    colors-table-plates(:data="data.plateType" :config="config.plates" :colourId="data.id" @add="addPlate" @remove="removePlate" @update="updatePlate" dataKey="id")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colors-table
  header
    +flex-fill

  .actions
    +flex($h: right)
</style>
