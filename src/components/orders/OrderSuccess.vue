<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from '@/components/orders/ColorsTable.vue'
import config from '@/data/config/color-table-reorder'
import router from '@/router'
import { DateTime } from 'luxon'
import { faker } from '@faker-js/faker'
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
    const index = ordersStore.cartOrders.indexOf(selectedOrder, 0);
    if (index > -1) {
        ordersStore.cartOrders.splice(index, 1);
        ordersStore.cartCount = ordersStore.cartCount - 1
    }
    router.push('/dashboard')
}
</script>

<template lang="pug">
.order-success
  sgs-scrollpanel
    template(#header)
      header
        h1.title Thank you for your order
    .card.disclaimer
      h1 Order Number: 2373
      p
        | The following plate re-order has been placed. &nbsp;
        br/
        | Your order is expected to be delivered on &nbsp;
        em 21 Jul, 2023
    .card.context
      .f
        label Order Date
        span {{ DateTime.now().toFormat('dd LLL, yyyy hh:mm a') }}
      .f
        label Order Initated By
        span {{ faker.name.firstName() }} {{ faker.name.lastName() }}
      .f
        label Work Requested By
        span {{ faker.name.firstName() }} {{ faker.name.lastName() }}

      .f
        label Purchase Order #
        span 129839213
      .f
        label Item Code
        span {{ selectedOrder.itemCode }}
      .f
        label Client
        span {{ selectedOrder.brandName }}
      .f
        label Description
        span {{ selectedOrder.name }}
      .f
        label Pack Type
        span {{ selectedOrder.packType }}
      .f
        label Printer
        span {{ selectedOrder.printerName }}
        span.separator /
        span {{ selectedOrder.printerLocation }}
      .f
        label Shipping Address
        span --
    .card
      h3 Image Carrier Specs
      colors-table.p-datatable-sm(:config="config" :data="colors")
    template(#footer)
      footer
        .secondary-actions
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
    background: rgba($sgs-green, 0.1)
    margin: $s
    font-weight: 500
    em
      font-weight: 600
      font-style: normal

  .f
    padding: $s25 0
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.1)
    &:last-child
      border-bottom: none

    label
      font-weight: 500
      width: 15rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block
</style>
