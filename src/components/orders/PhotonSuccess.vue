<template lang="pug">
.order-success(v-if="selectedOrder")
  sgs-scrollpanel
    template(#header)
    .card.disclaimer
      h1 Order Number: {{ selectedOrder.id }}
    .card.context
      .f
        label Order Date
        span {{ DateTime.now().toFormat('dd LLL, yyyy hh:mm a') }}
      .f(v-if="selectedOrder.expectedDate")
        label Expected Delivery Date
        span {{ expectedDate }}
      .f(v-if="selectedOrder.originalOrderId")
        label Order Initated By
        span {{ authb2cStore.currentB2CUser.displayName ? authb2cStore.currentB2CUser.displayName : (authStore.currentUser.displayName) }}
      .f(v-if="selectedOrder.weight")
        label Weight
        span {{ selectedOrder.weight }}
      .f(v-if=" !isOrderCancel && selectedOrder.po")
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
          sgs-button#cancel-order(v-if="isOrderCancel" label="Select if this is correct" @click="handleCancelOrder()")
          sgs-button#close(label="Close" @click="handleClose()")
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from "@/components/orders/ColorsTable.vue";
import config from "@/data/config/color-table-reorder";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import ReorderService from "@/services/ReorderService";
import { useNotificationsStore } from "@/stores/notifications";
import * as Constants from "@/services/Constants";

const router = useRouter();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const notificationsStore = useNotificationsStore();
let selectedOrder = computed(() => ordersStore.successfullReorder);
const isOrderCancel = computed(() => ordersStore.isCancel);
const colors = computed(() =>
  ordersStore.flattenedColors("success").filter((color) => color.sets),
);

const expectedDate = ref("");
const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
});

onBeforeMount(async () => {
  let response = await ReorderService.getPhotonReorderDetails(props.selectedId);
  if (response.result) {
    let orderDetails = JSON.parse(JSON.stringify(response.data));
    if (orderDetails?.statusId == 4) {
      await ordersStore.setOrderInStore(orderDetails);
      expectedDate.value = formatExpectedDateTime(orderDetails);
    } else {
      notificationsStore.addNotification(
        "The order number is incorrect or the order was not confirmed in image carrier reorder portal.",
        "Please check the link and try again.",
        { severity: "error", life: null, position: "top-right" },
      );
    }
  } else {
    this.notificationsStore.addNotification(
      Constants.ERROR,
      response.exceptionDetails.Message,
      { severity: "error", life: 5000 },
    );
    handleClose();
  }
});

watch(ordersStore.selectedOrder, async (value) => {
  selectedOrder.value = value;
  expectedDate.value = formatExpectedDateTime(value);
});

function formatExpectedDateTime(order) {
  if (order?.expectedDate) {
    const formattedDate = DateTime.fromISO(order.expectedDate);
    return formattedDate.toFormat("dd LLL, yyyy hh:mm a");
  }
  return "";
}

async function handleClose() {
  const form = document.querySelector(".page.success");
  if (form) {
    form.style.display = "none";
  }
  router.push(`/dashboard?q=${Date.now()}`);
}
</script>

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
