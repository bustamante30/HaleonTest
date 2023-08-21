<script setup>
import { ref, watch, onMounted } from 'vue'
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
  },
  loading: {
    type: Boolean,
    default: () => false
  },
})

const ordersStore = useOrdersStore();


const emit = defineEmits(['update'])

const selected = ref([])


function stylify(width) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { width: 'auto', flex: '1' }
}

function setDefaultValues(obj, defaultValue) {
  if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
    obj[key] = defaultValue;

  }
}

onMounted(() => {
  let colorData = (props.data && props.data.filter(x => x.sets > 0))

  // selected.value = [...colorData]
})

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    const prevColorIds = prevColors && prevColors.map(c => c.jobTechSpecColourId)
    const colorIds = colors.map(c => c.jobTechSpecColourId)
    // If color added sets = 1
    colors.forEach((color) => {
      if (prevColorIds && !prevColorIds.includes(color.jobTechSpecColourId) && color.sets < 1) {
        updateColor({ id: color.jobTechSpecColourId, field: 'sets', value: 1 })
      }
    })
    // If color removed sets = 0
    prevColors && prevColors.forEach((color) => {
      if (!colorIds.includes(color.jobTechSpecColourId)) {
        updateColor({ id: color.jobTechSpecColourId, field: 'sets', value: 0 })
      }
    })
  }
})

function updateColor({ id, field, value }) {
  emit('update', { id, field, value })
}

</script>

<template lang="pug">
data-table.colors-table(:value="data" v-model:selection="selected" scrollable scrollHeight="flex" :rows="30" dataKey="jobTechSpecColourId" :lazy="true" :loading="loading" :style="{ minHeight: '25rem'}")
  //- template(#loading)
  //-   i.pi.pi-spin.pi-cog.spinning
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
.spinning
  font-size: 1rem
  background-color: white
</style>