<script lang="ts" setup>
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
  },
  loading: {
    type: Boolean,
    default: () => false
  },
})

const emit = defineEmits(['update'])

const selected = ref([] as any[])
const expandedRows = ref([])

onBeforeMount(() => {
  selected.value = props?.data?.filter((c: any) => c.totalSets)
})

function stylify(width: any) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    const prevColorIds = (prevColors as any).map((c: { checkboxId: any }) => c.checkboxId)
    const colorIds = (colors as any).map((c: { checkboxId: any }) => c.checkboxId)
    // If color added sets = 1
    colors.forEach((color: any) => {
      const { checkboxId } = color
      if (!(prevColorIds as any).includes(color.checkboxId)) {
        if (!color.totalSets) updateColor({ checkboxId, field: 'sets', value: 1 })
      }
    })
    // If color removed sets = 0
    prevColors.forEach((color: any) => {
      const { checkboxId } = color
      if (!colorIds.includes(color.checkboxId)) {
        updateColor({ checkboxId, field: 'sets', value: 0 })
      }
    })
  }
})

function updateColor({ checkboxId, field, value }: any) {
  emit('update', { checkboxId, field, value })
}

function addPlate(params: any) {
  ordersStore.addPlate(params)
}

function removePlate(params: any) {
  ordersStore.removePlate(params)

}

async function updatePlate(params: any) {
  ordersStore.updatePlate(params)
  if (params?.field === 'sets') {
    const isAlreadySelected = selected?.value.find((c: any) => c.checkboxId === params?.colourId)
    if (params?.value) {
      const colour = props.data.find((c: any) => c.checkboxId === params?.colourId)
      if (!isAlreadySelected) selected.value = [...selected?.value, colour]
    } else {
      if (isAlreadySelected) selected.value = selected?.value?.filter((c: any) => c.checkboxId !== params?.colourId)      
    }
  }
}

</script>

<template lang="pug">
data-table.colors-table.p-datatable-sm(:value="data" v-model:selection="selected" v-model:expandedRows="expandedRows" scrollable scrollHeight="flex" :rows="30" :dataKey="config.dataKey" :loading="loading" :style="{ minHeight: '25rem'}")
  column(expander headerStyle="width: 3rem")
  column(v-if="isEditable" selectionMode="multiple" headerStyle="width: 3rem")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
  template(#expansion="{ data }")
    colors-table-plates(:data="data.plateType" :config="config.plates" :colourId="data.checkboxId" @add="addPlate" @remove="removePlate" @update="updatePlate")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colors-table
  header
    +flex-fill

  .actions
    +flex($h: right)
</style>
