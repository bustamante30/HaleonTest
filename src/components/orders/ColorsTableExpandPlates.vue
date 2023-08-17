<script lang="ts" setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TableActions from '@/components/ui/TableActions.vue'
import TableCell from '@/components/ui/TableCell.vue'
import { inject } from 'vue';

const props = defineProps({
  colourId: {
    type: String,
    default: null
  },
  config: {
    type: Object,
    default: () => {}
  },
  data: {
    type: Object,
    default: () => {}
  }
})

const options = inject('options')

const emit = defineEmits(['update', 'add', 'remove'])

function stylify(width: any) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

function updatePlate({ id, field, value }: { id: number, field: string, value: any }) {
  const { colourId } = props
  console.log('update plate', { colourId, id, field, value })
  if (colourId) emit('update', { colourId, plateTypeId: id, field, value })
}

function addPlate() {
  const { colourId } = props
  // console.log('add plate', { colourId })
  if (colourId) emit('add', { colourId })
}

function removePlate(plate: any) {
  const { plateTypeId } = plate
  updatePlate({ id: plateTypeId, field: 'sets', value: 0 })
  // const { colourId, data } = props
  // const plate = data.find((plate: { plateTypeId: any; }) => plate.plateTypeId === plateId)
  // console.log('remove plate', { colourId, ...plate })
  // if (colourId && plate) emit('remove', { colourId, ...plate })
}
</script>

<template lang="pug">
.plates
  data-table.plate-details.p-datatable-sm(:value="data" :data-key="config.dataKey || 'id'")
    column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
      template(#body="{ data }")
        table-cell(:config="col" :data="data" :data-key="config.dataKey" @update="updatePlate" :options="options")
    column
      template(#body="{ data }")
        sgs-button.sm.alert.secondary(@click="removePlate(data)" icon="delete")
  .actions
    sgs-button.sm(icon="add" label="Add Plate Type" @click="addPlate")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.plates
  margin-left: 6rem
  .actions
    padding: $s50 0
</style>
