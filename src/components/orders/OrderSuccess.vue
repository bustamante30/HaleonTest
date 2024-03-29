<template lang="pug">
.order-success(v-if="selectedOrder")
  sgs-scrollpanel
    template(#header)
      header(:class="{'cancelled': isOrderCancel }")
        h1.title {{ isOrderCancel ? 'Order Cancel' : 'Thank you for your order' }}
    .card.disclaimer
      h1 Order Number: {{ selectedOrder.id }}
      p(v-if="!isOrderCancel")
        | The following plate re-order has been placed. &nbsp;
        br/
        | Your order is expected to be delivered on &nbsp;
        em(v-if="selectedOrder.expectedDate") {{ expectedDate }}
        br/
        em(v-if="authb2cStore.currentB2CUser.displayName") You will have 10 minutes to cancel your order through this portal
    .card.context
      .f
        label Order Date
        span {{ DateTime.now().toFormat('dd LLL, yyyy hh:mm a') }}
      .f(v-if="selectedOrder.originalOrderId")
        label Order Initated By
        span {{ userName }}
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
        label Brand
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
        span {{ selectedOrder.address}}
      .f(v-if="!isOrderCancel && selectedOrder.notes")
        label Notes
        span {{ selectedOrder.notes }}
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

<script setup>
import { computed, onBeforeMount, watch, ref, onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";
import { useCartStore } from "@/stores/cart";
import ColorsTable from "@/components/orders/ColorsTable.vue";
import config from "@/data/config/color-table-reorder";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from "@/stores/notifications";
import * as Constants from "@/services/Constants";
import { useUsersStore } from "@/stores/users";

const router = useRouter();
const ordersStore = useOrdersStore();
const cartStore = useCartStore();
const authb2cStore = useB2CAuthStore();
const notificationsStore = useNotificationsStore();
const usersStore = useUsersStore();
let selectedOrder = computed(() => ordersStore.successfullReorder);
const isOrderCancel = computed(() => ordersStore.isCancel);
const colors = computed(() =>
  ordersStore.flattenedColors("success").filter((color) => color.sets),
);
const expectedDate = ref("");
const user = computed(() => usersStore.user);
const userName = computed(() => {
  return user.value ? `${user.value.firstName} ${user.value.lastName}` : "";
});

onBeforeMount(async () => {
  let x = ordersStore.selectedOrder?.expectedDate?.toString();
  if (ordersStore.selectedOrder?.expectedDate instanceof Date)
    x = ordersStore.selectedOrder?.expectedDate?.toISOString();
  expectedDate.value = DateTime.fromISO(x).toFormat("dd LLL, yyyy hh:mm a");
});

onMounted(async () => {
  await usersStore.getUser(ordersStore.successfullReorder?.createdBy, 0);
  const index = cartStore.cartOrders.indexOf(ordersStore.successfullReorder, 0);
  if (index > -1) {
    cartStore.cartOrders.splice(index, 1);
  }
});

async function handleClose() {
  const form = document.querySelector(".page.success");
  if (form) {
    form.style.display = "none";
  }
  router.push(`/dashboard?q=${Date.now()}`);
}

async function handleCancelOrder() {
  if (selectedOrder.value) {
    const response = await ordersStore.cancelOrder(
      selectedOrder.value.id,
      true,
    );
    if (response.result && response.data) {
      ordersStore.isCancel = false;
      notificationsStore.addNotification(
        Constants.SUCCESS,
        Constants.CANCEL_DELETE_SUCCESS,
        { severity: "success" },
      );
      await router.push(`/dashboard?q=${Date.now()}`);
    } else {
      notificationsStore.addNotification(
        Constants.ERROR,
        response.exceptionDetails.Message,
        { severity: "error", life: 5000 },
      );
    }
  }
}

watch(ordersStore.selectedOrder, (value) => {
  selectedOrder.value = value;
});
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
