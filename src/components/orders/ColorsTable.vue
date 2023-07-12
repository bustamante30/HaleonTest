<script setup>
import { ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { DateTime } from 'luxon'
import router from '@/router'

import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import { useOrdersStore } from '@/stores/orders'

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

const ordersStore = useOrdersStore();


const emit = defineEmits(['update'])

const selected = ref([])


function stylify(width) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

function checkAllValuesZero(arr, property) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][property] !== 0) {
      return false;
    }
  }
  return true;
}

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    const prevColorIds = prevColors && prevColors.map(c => c.mcgColourId)
    const colorIds = colors.map(c => c.mcgColourId)
    // If color added sets = 1
    colors.forEach((color) => {
      if (prevColorIds && !prevColorIds.includes(color.mcgColourId)) {
        updateColor({ id: color.mcgColourId, field: 'sets', value: 1})
      }
    })
    // If color removed sets = 0
    prevColors && prevColors.forEach((color) => {
      if (!colorIds.includes(color.mcgColourId)) {
        updateColor({ id: color.mcgColourId, field: 'sets', value: 0 })
      }
    })
  } 
})

function updateColor({ id, field, value }) {
  emit('update', { id, field, value })
}

</script>

<template lang="pug">
data-table.colors-table(:value="data" v-model:selection="selected" scrollable scrollHeight="flex" :rows="30" dataKey="mcgColourId")
  column(v-if="isEditable" selectionMode="multiple" headerStyle="width: 3rem")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colors-table
  header
    +flex-fill
</style>
