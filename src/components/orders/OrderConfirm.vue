<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from './ColorsTable.vue'
import router from '@/router'
import config from '@/data/config/color-table-order'


import { useColorsStore } from '@/stores/colors'

const colorsStore = useColorsStore()
const colors = computed(() => colorsStore.colors)

const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
 });

onBeforeMount(() => {
  ordersStore.getOrders()
  colorsStore.getColors()
  ordersStore.getOrderById(props.selectedId)
});


const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);

function confirm() {
  router.push(`/${props.selectedId}/success`)
}
</script>

<template lang="pug">
.order-confirmation
  sgs-scrollpanel
    template(#header)
      header
        h1.title Please confirm your order
    .card.context
      .f
        label Client
        span {{ selectedOrder.brandName }}
      .f
        label Description
        span {{ selectedOrder.name }}
      .f
        label Item Code
        span {{ selectedOrder.itemCode }}
      .f
        label Pack Type
        span {{ selectedOrder.packType }}
      .f
        label Printer
        span {{ selectedOrder.printerName }}
        span.separator /
        span {{ selectedOrder.printerLocation }}
    .card.colors
      h3 Plates
      .details
        colors-table.p-datatable-sm(:config="config" :data="colors")
    template(#footer)
      footer
        .actions
          sgs-button.default(label="Back" @click="router.push(`/${props.selectedId}/reorder`)")
          sgs-button(label="Confirm" @click="confirm()")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.order-confirmation
  +container
  header
    +flex-fill
    background: $sgs-gray
    padding: $s50 $s
    .title
      color: white
    a.close
      opacity: 0.6
      span.material-icons
        color: white
      &:hover
        opacity: 1

  .card:not(:last-child)
    padding-bottom: 0

  .context
    h4
      label
        font-weight: 500
        opacity: 0.6
        display: inline-block
        margin-right: $s50

  .f
    padding: $s25 0
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.1)
    label
      font-weight: 500
      width: 7rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block

  footer
    padding: $s
    .actions
      +flex($h: right)
      > *
        margin-left: $s
</style>
