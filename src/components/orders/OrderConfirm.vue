<template lang="pug">
.order-confirmation
  sgs-scrollpanel
    template(#header)
      header
        h1.title Please confirm your order
        a.close(@click="router.push('/dashboard')")
          span.material-icons.outline close
    .card.context
      .thumbnail(v-if="selection && selection.thumbNailPath")
        prime-image.image(
          :src="selection.thumbNailPath" alt="Image" preview :image-style="{ height: '100%', width: 'auto', maxWidth: '100%' }"
          :pt="{ toolbar: {onclick: 'stopEvent(event)'}}")
      .details
        .f
          label Client
          span {{ selection.brandName }}
        .f
          label Description
          span {{ selection.description }}
        .f
          label Item Code
          span {{ selection.itemCode }}
        .f
          label Pack Type
          span {{ selection.packType }}
        .f
          label Printer
          span {{ selection.printerName }}
        .f.shipping
          label Shipping Adress
          span {{ selection.address }}
    .card.colors
      h3 Plates
      .details
        colors-table.p-datatable-sm(:config="config" :data="colors")
    template(#footer)
      footer
        .secondary-actions
          sgs-button#back.default(label="Back" @click="router.push(`/dashboard/${props.selectedId}/reorder?source=${'confirm'}`)")
        .actions
          sgs-button#confirm(label="Confirm" @click="confirm()")

  // eslint-disable-next-line vue/no-v-model-argument
  prime-dialog(v-model:visible="isFormVisible" modal :closable="false" :style="{ width: '50rem' }")
    template(#header)
      header.dialog
        h4 Confirm following details
        .urgent
          h5 Urgent Order? (within 24 hours)
          .switch
            prime-input-switch.checkbox.sm(:model-value="checkout.isUrgent" @update:model-value="handleUrgentToggle")
            span {{ checkout.isUrgent ? 'Yes' : 'No'  }}
    order-confirm-form(:checkout="checkout" :is-urgent="checkout.isUrgent" @change="updateCheckout($event)")
    span.error-message(v-if="errorMessage !== ''") 
      span(v-if="errorMessage !== ''") {{ errorMessage }}
    template(#footer)
      footer.dialog(:class="{ disclaimer: checkout.isUrgent }")
        span 
          span(v-if="checkout.isUrgent") Additional charges may be applicable for urgent orders
        .actions
          sgs-button#cancel-po.default.sm(label="Cancel" @click="cancelPOForm")
          sgs-button#confirm-order.alert.sm(:icon="loading.reorder ? 'progress_activity' : ''" :icon-class="loading.reorder ? 'spin' : ''" :label="checkout.isUrgent ? 'Confirm as Urgent' : 'Confirm'" :disabled="loading.confirm" @click="placeOrder($event)")
          

</template>

<!-- eslint-disable no-undef -->
<script setup>
import { useOrdersStore } from "@/stores/orders";
import { useCartStore } from "@/stores/cart";
import ColorsTable from "./ColorsTable.vue";
import router from "@/router";
import config from "@/data/config/color-table-order";
import OrderConfirmForm from "./OrderConfirmForm.vue";
import ReorderService from "@/services/ReorderService";
import { useNotificationsStore } from "@/stores/notifications";
import * as Constants from "@/services/Constants";

const ordersStore = useOrdersStore();
const cartStore = useCartStore();
const notificationsStore = useNotificationsStore();
const checkout = computed(() => ordersStore.checkout);

const props = defineProps({
  selectedId: { type: String, default: () => "" },
});

const selection = computed(() => ordersStore.selectedOrder);
const loading = computed(() => ordersStore.loading);
const colors = computed(() =>
  ordersStore.flattenedColors().filter((color) => color.sets),
);
const errorMessage = ref("");
let isFormVisible = ref(false);

onMounted(async () => {
  await resetPOForm();
});

function confirm() {
  isFormVisible.value = true;
}

async function cancelPOForm() {
  isFormVisible.value = false;
  resetPOForm();
}

async function resetPOForm() {
  ordersStore.checkout = {
    expectedDate: null,
    purchaseOrder: [""],
    reorderdocs: [],
    isUrgent: false,
  };
  ordersStore.loading.reorder = false;
}

function validatePOForm() {
  if (
    ordersStore.checkout.expectedDate === "" ||
    ordersStore.checkout.expectedDate === null
  ) {
    notificationsStore.addNotification(
      Constants.MANDATORY_FIELDS_MSG,
      Constants.INVALID_DATE_TIME,
      { severity: "warn", position: "top-right" },
    );
    return false;
  }

  let validSpecialCharacters = [
    "-",
    "_",
    "/",
    "\\",
    "#",
    ".",
    ",",
    "+",
    "&",
    "(",
    ")",
    " ",
    ":",
    ";",
    "<",
    ">",
    "'",
  ];

  for (let i = 0; i < checkout.value.purchaseOrder.length; i++) {
    const poNumber = checkout.value.purchaseOrder[i]?.trim();
    if (poNumber != null && poNumber.length > 0) {
      if (poNumber.length < 3) {
        notificationsStore.addNotification(
          Constants.PO_FORM_ERROR,
          Constants.PO_NUMBER_MIN_LENGTH,
          { severity: "warn", position: "top-right" },
        );
        return false;
      }

      for (let i = 0; i < poNumber.length; i++) {
        if (
          !validSpecialCharacters.includes(poNumber[i]) &&
          !/^[a-zA-Z0-9]$/.test(poNumber[i])
        ) {
          notificationsStore.addNotification(
            Constants.PO_FORM_ERROR,
            Constants.INVALID_PO_NUMBER,
            { severity: "warn", position: "top-right" },
          );
          return false;
        }
      }
    }
  }
  return true;
}

function checkDuplicatePONumbers() {
  const poArray = checkout.value.purchaseOrder;
  var duplicates = poArray.filter(
    (poNumber, index) => poArray.indexOf(poNumber) !== index,
  );

  duplicates = Array.from(new Set(duplicates));

  if (duplicates != null && duplicates.length > 0) {
    notificationsStore.addNotification(
      Constants.PO_FORM_ERROR,
      Constants.DUPLICATE_PO_NUMBER + " " + duplicates,
      { severity: "warn", position: "top-right", life: null },
    );
    return false;
  }
  return true;
}

async function placeOrder() {
  ordersStore.loading.confirm = true;
  if (validatePOForm() && checkDuplicatePONumbers()) {
    ordersStore.loading.reorder = true;
    if (ordersStore.selectedOrder.statusId === 1) {
      // add reorder flow
      ordersStore.selectedOrder.reorderDocs = checkout.value.reorderdocs;
      let draftResult = await ReorderService.submitReorder(
        ordersStore.selectedOrder,
        2,
        true,
      );
      if (!draftResult.result) {
        notificationsStore.addNotification(
          `Error`,
          draftResult.exceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
        ordersStore.loading.confirm = false;
      } else {
        let index = cartStore.cartOrders.indexOf(ordersStore.selectedOrder);
        cartStore.cartOrders[index] = draftResult.data;
        ordersStore.successfullReorder = draftResult.data;
        cartStore.getCartCount();
        resetPOForm();
        router.push(`/dashboard/${props.selectedId}/success`);
      }
    } else {
      // completed reorder flow
      ordersStore.selectedOrder.reorderDocs = checkout.value.reorderdocs;
      let compResult = await ReorderService.submitReorder(
        ordersStore.selectedOrder,
        2,
      );
      if (!compResult.result) {
        notificationsStore.addNotification(
          `Error`,
          compResult.exceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
        ordersStore.loading.confirm = false;
      } else {
        ordersStore.setOrderInStore(compResult.data);
        resetPOForm();
        router.push(`/dashboard/${props.selectedId}/success`);
      }
    }
  }
  ordersStore.loading.confirm = false;
  ordersStore.loading.reorder = false;
}

function updateCheckout(values) {
  ordersStore.checkout.isUrgent = values.isUrgent;
  ordersStore.updateCheckout(values);
}

function handleUrgentToggle(event) {
  ordersStore.checkout.isUrgent = event;
  ordersStore.checkout.expectedDate = null;
  ordersStore.updateCheckout(ordersStore.checkout);
}
</script>

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
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 16rem
      > .image
        width: 100%
        margin-bottom: $s
      > button
        margin: 0 auto
    .details
      padding: 0 $s
      flex: 1
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
      width: 10rem
      display: inline-block

.error-message
  padding-left: 30px
  color: red
  font-weight: bolder
  font-size: 14px

.address
  width:65%

.shipping
 +flex

header.dialog
  +flex-fill
  width: 100%

footer.dialog
  +flex-fill
  padding: $s50 $s
  margin-top: $s50
  border-top: 1px solid rgba($sgs-gray, 0.2)
  width: 100%
  flex: 1
  &.disclaimer
    background: $accent-light-3
    > span
      display: inline-block
      text-align: left
      flex: 1

.urgent
  +flex-fill
  background: $sgs-red
  color: #FFF
  padding: $s25 $s
  margin: 0
  border-radius: 3px
  width: 21rem
  .checkbox
    margin: $s50
  .switch
    +flex
  h5
    margin: 0
</style>
