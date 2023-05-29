<template lang="pug">
form.advanced-search
  sgs-scrollpanel
    template(#header)
      header
        h3 Advanced Search
        p.hint Enter at least 2 fields. Printer location is a mandatory
    .form-fields(v-if="advancedFilters")
      .field-group(v-for="section in sections")
        h4(v-if="section.label") {{ section.label }}
        .f(v-for="filter in section.filters")
          label(v-if="filter.label") {{ filter.label }}
          prime-dropdown.sm(v-if="filter.type === 'select'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" :options="[]")
          prime-calendar(v-else-if="filter.type === 'daterange'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" selectionMode="range" appendTo="body")
          .fields(v-else-if="filter.type === 'imageCarrierCodeType'")
            prime-dropdown.code(v-if="advancedFilters[filter.name]" v-model="advancedFilters[filter.name].type" name="imageCarrierCodeType" :inputId="imageCarrierCodeType" :options="imageCarrierCodeTypes" appendTo="body" optionLabel="label" optionValue="value")
            prime-inputtext.sm(v-if="advancedFilters[filter.name]" v-model="advancedFilters[filter.name].code")
          prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
    template(#footer)
      .actions
        sgs-button.default(label="Clear")
        sgs-button(label="Search" @click="")
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['change'])

const advancedFilters = computed({
  get: () => props.filters,
  set: (val) => {
    console.log(val)
    // count.value = val - 1
  }
})


const imageCarrierCodeTypes = ref([
  { label: 'UPC Code', value: 'UPC' },
  { label: 'QR Code', value: 'QR' },
  { label: 'EAN Code', value: 'EAN' },
  { label: 'Data Matrix Code', value: 'DATA_MATRIX' },
])

let imageCarrierCodeType = ref('UPC')

function update(event) {
  console.log(event)
  emit('change')
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.advanced-search
  +fixed-e
  +container
  width: 30rem
  background: white
  box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
  padding: $s
  z-index: $z-mask + 1
  background: #f6f6f6
  .form-fields
    padding: $s 0
    .field-group
      background: white
      padding: $s
      margin: 0 $s $s 0
      h4
        margin-top: 0
  .f
    padding: $s25
    > label
      display: block
      margin-bottom: $s25
    > .input
      width: 100%
    .code
      width: 10rem
  .fields
    +flex
    gap: $s
  .actions
    +flex(center, right)
    padding: $s 0 0
    gap: $s
    // > *
    //   flex: 1

</style>
