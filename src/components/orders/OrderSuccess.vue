<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount, watch, ref, onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";
import { useCartStore } from '@/stores/cart'
import ColorsTable from "@/components/orders/ColorsTable.vue";
import config from "@/data/config/color-table-reorder";
import router from "@/router";
import { DateTime } from "luxon";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from '@/stores/notifications';

const ordersStore = useOrdersStore();
const cartStore = useCartStore()
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const notificationsStore = useNotificationsStore();

let selectedOrder = computed(() => ordersStore.successfullReorder);
const colors = computed(() => ordersStore.flattenedColors('success').filter(color => color.sets))
const expectedDate = ref("");

onBeforeMount(async () => {
  let x = ordersStore.selectedOrder?.expectedDate?.toString();
  if (ordersStore.selectedOrder?.expectedDate instanceof Date)
    x = ordersStore.selectedOrder?.expectedDate?.toISOString();
  expectedDate.value = DateTime.fromISO(x).toFormat("dd LLL, yyyy hh:mm a");
});

onMounted(async () => {
  const index = cartStore.cartOrders.indexOf(ordersStore.selectedOrder, 0);
  if (index > -1) {
    cartStore.cartOrders.splice(index, 1);
  }
});

async function handleClose() {
  const form = document.querySelector(".page.success");
  if (form) {
    form.style.display = "none";
  }
  window.location.replace('/dashboard')
}

async function handleCancelOrder() {
  if (selectedOrder) {
    const cancelResult = await ordersStore.cancelOrder(selectedOrder.value.id, true);
    if (cancelResult) {
      notificationsStore.addNotification(`Success`, 'Order Cancelled successfully', { severity: 'success' })
      await router.push(`/dashboard`);
      await ordersStore.getOrders();
    } else {
      notificationsStore.addNotification(`Error`, '10 mins window closed for Re-Order cancellation', { severity: 'error' })
      // Handle error or show a notification
    }
  }
}

watch(ordersStore.selectedOrder, (value) => {
  selectedOrder = value;
});
</script>

<template lang="pug">
.order-success(v-if="selectedOrder")
  sgs-scrollpanel
    template(#header)
      header(:class="{'cancelled': ordersStore.isCancel }")
        h1.title {{ ordersStore.isCancel ? 'Order Cancel' : 'Thank you for your order' }}
    .card.disclaimer
      h1 Order Number: {{ selectedOrder.id }}
      p(v-if="!ordersStore.isCancel")
        | The following plate re-order has been placed. &nbsp;
        br/
        | Your order is expected to be delivered on &nbsp;
        em(v-if="selectedOrder.expectedDate") {{ expectedDate }}
    .card.context
      .f
        label Order Date
        span {{ DateTime.now().toFormat('dd LLL, yyyy hh:mm a') }}
      .f(v-if="selectedOrder.originalOrderId")
        label Order Initated By
        span {{ authb2cStore.currentB2CUser.displayName ? authb2cStore.currentB2CUser.displayName : (authStore.currentUser.displayName) }}
      .f(v-if="selectedOrder.weight")
        label Weight
        span {{ selectedOrder.weight }}
      .f(v-if=" !ordersStore.isCancel && selectedOrder.po")
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
    .card(v-if="colors && colors.length>0")
      h3 Image Carrier Specs
      colors-table.p-datatable-sm(:config="config" :data="colors")
    template(#footer)
      footer
        .secondary-actions
        .actions
          sgs-button(v-if="ordersStore.isCancel" label="Select if this is correct" @click="handleCancelOrder()")
          sgs-button(label="Close" @click="handleClose()")
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
  .cancelled
    background: $red-light-1
    color: $sgs-white
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
