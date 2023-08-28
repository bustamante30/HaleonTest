<script setup>
import { ref, computed } from "vue";
import ColorsTable from "@/components/orders/ColorsTable.vue";
import config from "@/data/config/color-table";
import { useColorsStore } from "@/stores/colors";
import router from "@/router";
import { useCartStore } from "@/stores/cart";
import { useConfirm } from "primevue/useconfirm";
import { useNotificationsStore } from '@/stores/notifications'
import { renderToString } from "@vue/test-utils";

defineProps({
  order: {
    type: Object,
    default: () => {},
  },
});

const notificationsStore = useNotificationsStore()
const confirm = useConfirm();
const colorsStore = useColorsStore();
const colors = computed(() => order.flattenedColors());
const isSpecsVisible = ref(false);
const cartStore = useCartStore();


function toggleColors() {
  isSpecsVisible.value = !isSpecsVisible.value;
}

function goto(path) {
  router.push(path);
}
async function discardOrder(order) {
  confirm.require({
    message: "Are you sure you want to discard this draft?",
    header: "Confirmation - Discard Draft",
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    accept: async () => {
      await cartStore.discardOrder(order.id)
    },
    reject: () => {},
  });
}
function pendingOrderSets(colors){
  let result = true
  for (let i=0; i<colors.length; i++)
    if (colors[i].sets > 0)
      result = false
  return result
}
function getShippingAddress(order) {
  if (!order.customerContacts) {
    return "No printer site provided";
  }
  return order.customerContacts[0].shippingAddress
    ? order.customerContacts[0].shippingAddress
    : "";
}

function reorder(id) {
  cartStore.reorderFromCart(id)
  goto(`/dashboard/${id}/reorder`)
}
</script>

<template lang="pug">
.cart-order
  h2
    span {{ order.brandName }}
    span.separator |
    span {{ order.description }}
  .summary
    .thumbnail
      prime-image.image(:src="order.thumbNailPath" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
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
        span {{ order.printerLocationName }}
      .f
        label Shipping Address
        span  {{getShippingAddress(order)}}
      a.specs(@click="toggleColors") View Specs
      .colors(v-if="isSpecsVisible")
        colors-table.p-datatable-sm(:config="config" :data="order.colors")
      footer
        .secondary-actions
        .actions
          sgs-button.sm.alert.secondary(icon="delete" @click="discardOrder(order)")
          sgs-button.sm.secondary(label="View Order" @click="goto(`/dashboard/${order.originalOrderId}`)")
          sgs-button.sm(icon="redo" label="ReOrder" @click="reorder(order.id)")
          //- :disabled="pendingOrderSets(order.colors)"
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
