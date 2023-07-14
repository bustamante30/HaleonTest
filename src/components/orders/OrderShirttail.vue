<script lang="ts" setup>
import { config } from '@/data/config/shirttail'
import { get } from 'lodash'

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  },
})

</script>

<template lang="pug">
.order-shirttail
  sgs-panel(header="Product Details")
    .fields(v-if="config && config.fields")
      .f(v-for="field in config.fields")
        label {{ field.label }}
        span.value {{ get(data, field.name) }}
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.order-shirttail
  pading: $s
  .fields
    display: grid
    grid-template-columns: repeat(4, 1fr)
    gap: $s25 $s
    min-height: 0
    min-width: 0
    padding: $s
    .f
      overflow: hidden
      min-width: 0
      label
        font-size: 0.9rem
        margin-bottom: $s25
      span.value
        font-size: 0.9rem
        font-weight: 600
        display: inline-block
        width: 100%
        text-overflow: ellipsis
        white-space: nowrap
        overflow: hidden
</style>
