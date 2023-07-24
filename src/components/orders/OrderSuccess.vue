<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount, watch } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from '@/components/orders/ColorsTable.vue'
import config from '@/data/config/color-table-reorder'
import router from '@/router'
import { DateTime } from 'luxon'

const props = defineProps({

 });

onBeforeMount(() => {
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

watch(ordersStore.selectedOrder, (value) => {
  selectedOrder = value
})
</script>

<template lang="pug">
.order-success
  sgs-scrollpanel
    template(#header)
      header
        h1.title Thank you for your order
    .card.disclaimer
      h1 Order Number: {{ selectedOrder.id }} 
      p
        | The following plate re-order has been placed. &nbsp;
        br/
        | Your order is expected to be delivered on &nbsp;
        em(v-if="selectedOrder.expectedDate") {{ DateTime.fromISO(selectedOrder.expectedDate).toFormat('dd LLL, yyyy hh:mm a') }}
    .card.context
      .f
        label Order Date
        span {{ DateTime.now().toFormat('dd LLL, yyyy hh:mm a') }}
      .f(v-if="selectedOrder.originalOrderId")
        label Order Initated By
        span {{ selectedOrder.originalOrderId }}
      .f(v-if="selectedOrder.customerContacts && selectedOrder.customerContacts.length>0")
        label Work Requested By
        span {{ selectedOrder.customerContacts[0].customerName }}
      .f(v-if="selectedOrder.weight")
        label Weight
        span {{ selectedOrder.weight }}
      .f(v-if="selectedOrder.po")
        label Purchase Order #
        span {{ selectedOrder.po }}
      .f(v-if="selectedOrder.itemCode")
        label Item Code
        span {{ selectedOrder.itemCode }}
      .f(v-if="selectedOrder.brandName")
        label Client
        span {{ selectedOrder.brandName }}
      .f(v-if="selectedOrder.description")
        label Description
        span {{ selectedOrder.description }}
      .f(v-if="selectedOrder.packType")
        label Pack Type
        span {{ selectedOrder.packType }}
      .f(v-if="selectedOrder.printerName")
        label Printer Name
        span {{ selectedOrder.printerName }}
      .f(v-if="selectedOrder.printerLocationName")
        label Printer Location Name
        span {{ selectedOrder.printerLocationName }}
      .f(v-if="selectedOrder.customerContacts && selectedOrder.customerContacts.length>0")
        label Shipping Address
        span {{ selectedOrder.customerContacts[0].shippingAddress}}
    .card(v-if="selectedOrder.colors && selectedOrder.colors.length>0")
      h3 Image Carrier Specs
      colors-table.p-datatable-sm(:config="config" :data="selectedOrder.colors.filter(x => x.sets)")
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
