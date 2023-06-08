<script setup>
import { ref, computed } from 'vue'
import ColorsTable from '@/components/orders/ColorsTable.vue'
import config from '@/data/config/color-table-edit'
import { useColorsStore } from '@/stores/colors'
import router from '@/router'

defineProps({
  order: {
    type: Object,
    default: () => { }
  }
})

const colorsStore = useColorsStore()
const colors = computed(() => colorsStore.colors)
const isSpecsVisible = ref(false)

function toggleColors() {
  isSpecsVisible.value = !isSpecsVisible.value
}

function goto(path) {
  router.push(path)
}
</script>

<template lang="pug">
.cart-order
  h2
    span {{ order.brandName }}
    span.separator |
    span {{ order.name }}
  .summary
    //- | {{ order }}
    .thumbnail
      prime-image.image(:src="order.image" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
    .details
      .f
        label Item Code
        span {{ order.itemCode }}
      .f
        label Pack Type
        span {{ order.packType }}
      .f
        label Product Weight
        span {{ order.weight }}
      .f
        label Printer
        span {{ order.printerName }}
        span.separator /
        span {{ order.printerLocation }}
      .f
        label Shipping Address
        span --
      a.specs(@click="toggleColors") View Specs
      .colors(v-if="isSpecsVisible")
        colors-table.p-datatable-sm(:config="config" :data="colors" :isEditable="true")
      footer
        .secondary-actions
        .actions
          sgs-button.sm.alert.secondary(icon="delete")
          sgs-button.sm.secondary(label="View Order" @click="goto(`/${order.id}`)")
          sgs-button.sm(icon="redo" label="ReOrder" @click="goto(`/${order.id}/confirm`)")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.cart-order
  padding: $s
  border-bottom: 1px solid rgba($sgs-gray, 0.2)
  h2
    margin-bottom: $s
  .summary
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
      padding: $s
      h2, h3, h4, p
        margin-top: 0
      .printer
        background: rgba($sgs-gray, 0.05)
        padding: $s75 $s

  .f
    padding: $s25 0
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.1)
    label
      font-weight: 500
      width: 10rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block

a.specs
  font-size: 0.9rem
  font-weight: 500
  display: inline-block
  padding: $s 0
</style>
