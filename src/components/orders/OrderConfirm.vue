<script setup>
import Image from 'primevue/image'
import { ref, computed, reactive, onMounted, onBeforeMount } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import ColorsTable from './ColorsTable.vue'
import router from '@/router'
import config from '@/data/config/color-table-order'
import OrderConfirmForm from './OrderConfirmForm.vue'
import ReorderService from "@/services/ReorderService";

const ordersStore = useOrdersStore()
const checkout = computed(() => ordersStore.checkout)

const props = defineProps({
  selectedId: { type: String, default: () => '', },
})

const selection = computed(() => ordersStore.selectedOrder)
const colors = computed(() => ordersStore.flattenedColors().filter(color => color.sets))

let isFormVisible = ref(false)

function confirm() {
  isFormVisible.value = true
}

const errorMessage = ref('');

async function placeOrder() {

  var dateError;
  if (checkout.value.expectedDate === '' || checkout.value.expectedDate === null) {
    dateError = true;
  } else {
    dateError = false;
  }
  if (ordersStore.selectedOrder.id > 0) {
    ordersStore.selectedOrder.statusId = 2
    let draftResult = await ReorderService.updateDraft(ordersStore.selectedOrder)
    if (!draftResult.success) {
      alert('Error updating draft')
    }
    else {
      let index = ordersStore.cartOrders.indexOf(ordersStore.selectedOrder)
      ordersStore.cartOrders[index] = draftResult.result
      ordersStore.selectedOrder = draftResult.result
    }
  }
  else {
    if (!dateError) {
      let result = await ReorderService.submitReorder(ordersStore.selectedOrder, 2)
      ordersStore.setOrderInStore(result)
      console.log(result)
    }
    else {
      errorMessage.value = "Date and time are mandatory fields";

    }
  }
  if (!dateError) {
    checkout.value.expectedDate = null
    checkout.value.expectedTime = null
    checkout.value.purchaseOrder = null
    router.push(`/dashboard/${props.selectedId}/success`);
  }
  else {
    errorMessage.value = "Date and time are mandatory fields";

  }
}

function updateCheckout(values) {
  ordersStore.updateCheckout(values)
}
function getShippingAddress() {

  if (!ordersStore.selectedOrder.customerContacts) {
    return "No printer site provided"
  }
  ordersStore.selectedOrder.customerContacts[0].isActive = true
  return ordersStore.selectedOrder.customerContacts[0].shippingAddress ? ordersStore.selectedOrder.customerContacts[0].shippingAddress : ""
}
function checkCustomerDetails() {
  return ordersStore.selectedOrder.customerContacts && ordersStore.selectedOrder.customerContacts.length === 1
}
</script>

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
        prime-image.image(:src="selection.thumbNailPath" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
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
          span.separator /
          span {{ selection.printerLocationName }}
        .f.shipping
          label Shipping Adress
          div(v-if="checkCustomerDetails()")
            span {{ getShippingAddress() }}
          div(v-if="selection.customerContacts && selection.customerContacts.length>1")
            prime-dropdown.sm.address(v-model="selection.customerContacts[0].shippingAddress" name="shipToAddress" :options="selection.customerContacts" appendTo="body" 
          optionLabel="shippingAddress" optionValue="shippingAddress")
    .card.colors
      h3 Plates
      .details
        colors-table.p-datatable-sm(:config="config" :data="colors")
    template(#footer)
      footer
        .secondary-actions
          sgs-button.default(label="Back" @click="router.push(`/dashboard/${props.selectedId}/reorder`)")
        .actions
          sgs-button(label="Confirm" @click="confirm()")

  prime-dialog(v-model:visible="isFormVisible" modal :closable="false" :style="{ width: '40rem' }" header="Confirm following details")
    order-confirm-form(:checkout="checkout" @change="updateCheckout($event)")
    span.error-message(v-if="errorMessage !== ''") 
      span(v-if="errorMessage !== ''") {{ errorMessage }}
    template(#footer)
      footer
        .secondary-actions &nbsp;
        .actions
          sgs-button.default.sm(label="Cancel" @click="isFormVisible = false")
          sgs-button.alert.sm(label="Confirm" @click="placeOrder($event)")
          

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
</style>
