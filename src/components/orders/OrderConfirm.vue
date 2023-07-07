<script setup>
import Image from 'primevue/image'
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import ColorsTable from './ColorsTable.vue'
import router from '@/router'
import config from '@/data/config/color-table-order'
import OrderConfirmForm from './OrderConfirmForm.vue'

const ordersStore = useOrdersStore()

const props = defineProps({
  selectedId: { type: String, default: () => '', },
 })

 onMounted(async() => {
  await ordersStore.getOrderById(props.selectedId)
})

const selectedOrder = computed(() => ordersStore.selectedOrder)
const colors = computed(() => ordersStore.selectedOrder.colors)

let isFormVisible = ref(false)

function confirm() {
  isFormVisible.value = true
}

function placeOrder() {
  router.push(`/dashboard/${props.selectedId}/success`)
}

function updateCheckout() {
  ordersStore.updateCheckout()
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
      .thumbnail
        prime-image.image(:src="selectedOrder.thumbNail" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
      .details
        .f
          label Client
          span {{ selectedOrder.brandName }}
        .f
          label Description
          span {{ selectedOrder.description }}
        .f
          label Item Code
          span {{ selectedOrder.itemCode }}
        .f
          label Pack Type
          span {{ selectedOrder.packType }}
        .f
          label Printer
          span {{ selectedOrder.printerName }}
          span.separator /
          span {{ selectedOrder.printerLocationName }}
        .f
          label Shipping Adress
          span --
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
    order-confirm-form(:checkout="checkout" @change="updateCheckout()")
    template(#footer)
      footer
        .secondary-actions &nbsp;
        .actions
          sgs-button.default.sm(label="Cancel" @click="isFormVisible = false")
          sgs-button.alert.sm(label="Confirm" @click="placeOrder()")

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
</style>
