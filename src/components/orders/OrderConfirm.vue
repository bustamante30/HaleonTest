<script setup>
import Image from 'primevue/image'
import { ref, computed, reactive, onMounted, onBeforeMount } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useCartStore } from '@/stores/cart'
import ColorsTable from './ColorsTable.vue'
import router from '@/router'
import config from '@/data/config/color-table-order'
import OrderConfirmForm from './OrderConfirmForm.vue'
import ReorderService from "@/services/ReorderService";

const ordersStore = useOrdersStore()
const cartStore = useCartStore()
const checkout = computed(() => ordersStore.checkout)

const props = defineProps({
  selectedId: { type: String, default: () => '', },
})

const selection = computed(() => ordersStore.selectedOrder)
const loading = computed(() => ordersStore.loading)
const colors = computed(() => ordersStore.flattenedColors().filter(color => color.sets))

let isFormVisible = ref(false)

function confirm() {
  isFormVisible.value = true
}

const errorMessage = ref('');

async function cancelPOForm(){
  isFormVisible.value = false;
  resetPOForm();
}

async function resetPOForm(){
  checkout.value.expectedDate = null
  checkout.value.expectedTime = null
  checkout.value.purchaseOrder = ['']
}

async function placeOrder() {
  ordersStore.loading.reorder = true
  var dateError;
  if (checkout.value.expectedDate === '' || checkout.value.expectedDate === null) {
    dateError = true;
  } else {
    dateError = false;
  }

  if (!dateError ) {
    if (ordersStore.selectedOrder.statusId === 1) {
      // add reorder flow
      ordersStore.selectedOrder.reorderDocs = checkout.value.reorderdocs
      let draftResult = await ReorderService.submitReorder(ordersStore.selectedOrder, 2, true)
      if (!draftResult.success) {
        alert('Error updating draft')
      }
      else {
        let index = cartStore.cartOrders.indexOf(ordersStore.selectedOrder)
        cartStore.cartOrders[index] = draftResult.result
        ordersStore.successfullReorder = draftResult.result
        cartStore.getCartCount()
      }
    }
    else {
      // completed reorder flow
      ordersStore.selectedOrder.reorderDocs = checkout.value.reorderdocs
      let compResult = await ReorderService.submitReorder(ordersStore.selectedOrder, 2)
      ordersStore.setOrderInStore(compResult.result)
    }
    
  
    resetPOForm();
    router.push(`/dashboard/${props.selectedId}/success`);
  }
  else {
    errorMessage.value = "Date and time are mandatory fields";

  }
  ordersStore.loading.reorder = false
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
          sgs-button.default(label="Back" @click="router.push(`/dashboard/${props.selectedId}/reorder?source=${'confirm'}`)")
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
          sgs-button.default.sm(label="Cancel" @click="cancelPOForm")
          sgs-button.alert.sm(:icon="loading.reorder ? 'progress_activity' : ''" :iconClass="loading.reorder ? 'spin' : ''" label="Confirm" @click="placeOrder($event)")
          

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
