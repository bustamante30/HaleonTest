<script lang="ts" setup>
import { faker } from '@faker-js/faker'
import { ref, onBeforeMount,watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const colours = ref([] as any[])

const emit = defineEmits(["update"])

// watch(
//   colours,(col)=>
//   {
//     console.log(col)
//     emit("update",col)
    
// }
//   )

onBeforeMount(() => {
  addColour()
})


function addColour() {
  const newColour: any = { id: faker.datatype.uuid(), name: null, quantity: 0 }
  colours.value.push(newColour)
  emit("update",colours.value)
}




function removeColour(colour : any = { id: faker.datatype.uuid(), name: null, quantity: 0 }) {
  const newColours = colours.value.filter(c => c.id !== colour.id)
  colours.value = newColours
  emit("update",colours.value)
}

function stylify(width: number) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: 'none' }
    : { minWidth: 'auto', maxWidth: 'auto', flex: '1' }
}

</script>

<template lang="pug">
.colours-table.edit
  data-table.p-datatable-sm(:value="colours")
    template(#header)
      header
        h4 Colours
        .actions
          sgs-button.sm.secondary(@click="addColour" icon="add" label="Add Colour")
    column(header="Colour Name")
      template(#body="{ data }")
        prime-inputtext.sm(v-model="data.name" @change="emit('update',colours)")
    column(header="Quantity" :headerStyle="stylify(5)" :bodyStyle="stylify(5)")
      template(#body="{ data }")
        prime-inputnumber.sm(v-model="data.quantity" showButtons buttonLayout="horizontal" :step="1" :min="0" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" @change="emit('update',colours)")
    column(:headerStyle="stylify(2)" :bodyStyle="stylify(2)")
      template(#body="{ data }")
        .actions
          sgs-button.sm.alert.secondary(@click="removeColour(data)" icon="delete")

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colours-table.edit
  border: 1px solid #ced4da
  header
    +flex-fill
    gap: $s
    h4
      margin: 0
  .actions
    +flex($h: right)
</style>
