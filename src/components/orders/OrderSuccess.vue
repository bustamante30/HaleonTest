<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from '@/components/orders/ColorsTable.vue'
import config from '@/data/config/color-table'
import router from '@/router'

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

function back() {
  router.push('/')
}
</script>

<template lang="pug">
.order-success
  sgs-scrollpanel
    template(#header)
      header
        h1.title Thank you for your order
    .card.context
      p The following plate re-order has been placed
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
        label Printer:
        span {{ selectedOrder.printerName }}
        span.separator /
        span {{ selectedOrder.printerLocation }}
    .card.disclaimer
      p The above order expected to be delivered on 21 May through BlueDart courier
    template(#footer)
      footer
        .actions
          sgs-button(label="Close" @click="back()")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.order-success
  +container
  header
    +flex-fill
    background: $sgs-green
    padding: $s50 $s
    a.close
      opacity: 0.6
      span.material-icons
        color: white
      &:hover
        opacity: 1

  .card.context
    h4
      label
        font-weight: 500
        opacity: 0.6
        display: inline-block
        margin-right: $s50

  .card.disclaimer
    background: rgba($sgs-gray, 0.05)
    margin: $s
    max-width: 40rem
    font-weight: 500

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
