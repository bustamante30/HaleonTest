<script setup>
import { useCartStore } from '@/stores/cart'
import { useNotificationsStore } from '@/stores/notifications'
import { useOrdersStore } from "@/stores/orders"
import { useRoute } from 'vue-router'
import ColorsTable from './ColorsTableExpand.vue'
import config from '@/data/config/color-table-edit'
import ReorderService from "../../services/ReorderService"
import router from '@/router'

const route = useRoute()

const ordersStore = useOrdersStore()
const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
  loading: {
    type: Object,
    default: () => ({ cart: false, reorder: false })
  }
})

const isCartMessageVisible = ref(false)
const cartCount = computed(()=> cartStore.cartCount)
const isOrderInCart = computed(()=> cartStore.isOrderInCart(props.selectedId))
const colors = computed(() => ordersStore.selectedOrder.colors);
const loading = computed(() => ordersStore.loading)
const disableReorder = computed(()=>{
  const totalSets = (colors.value && colors.value.filter(x => x.totalSets))
  return !(totalSets && totalSets.length)
})

const source = computed(() => route.query && route.query?.source)
const selectedOrder = computed(() => ordersStore.selectedOrder)
const isCartOrder = computed(() => isOrderInCart.value || selectedOrder?.statusId === 1)

onBeforeMount(async () => {
  // await ordersStore.getOrderById(props.selectedId)
})

function buy() {
  router.push(`/dashboard/${props.selectedId}/confirm`)
}



function updateColor(color) {
  ordersStore.updateColor(color)
}

function validateReorder() {
  let valid = true
  colors?.value.forEach(color => {
    if (!ordersStore.validateColour(color)) valid = false
  })
  return valid
}

function reorder() {
  const valid = validateReorder()
  if (valid) router.push(`/dashboard/${props.selectedId}/confirm`)
}``

async function addToCart() {
  const valid = validateReorder()
  if (valid) {
    if (isCartOrder.value) {
      updateToCart()
      return
    }
    if (await cartStore.addToCart(ordersStore.selectedOrder))
      isCartMessageVisible.value = true
  }
}

async function updateToCart() {
  if (await cartStore.updateToCart(ordersStore.selectedOrder))
    notificationsStore.addNotification(
          `Success`,
          "Cart updated successfully",
          { severity: "success" }
        );
}

function goBack() {
  
  if (source.value === 'cart')
    router.push(`/cart`)
  else
    router.push(`/dashboard/${props.selectedId}`)
}

</script>

<template lang="pug">
.page.details(v-if="selectedOrder")
  sgs-mask
  .container
    sgs-scrollpanel(:top="0")
      template(#header)
        header
          h1.title
            span Re-Order:&nbsp;
            span {{ selectedOrder.brandName }}
          a.close(@click="router.push('/dashboard')")
            span.material-icons.outline close
      .card.summary(v-if="selectedOrder")
        .thumbnail
          prime-image(:src="selectedOrder.thumbNailPath" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
        .card.details
          .f
            label Item Code
            span {{ selectedOrder.itemCode }}
          .f
            label Client
            span {{ selectedOrder.brandName }}
          .f
            label Description
            span {{ selectedOrder.description }}
          .f
            label Pack Type
            span {{ selectedOrder.packType }}
          .f
            label Product Weight
            span {{ selectedOrder.weight ?  selectedOrder.weight:'NA'}}
          .f
            label Printer
            span {{ selectedOrder.printerName }}
            span.separator /
            span {{ selectedOrder.printerLocationName }}
      .card
        colors-table(:config="config" :data="colors" :isEditable="true" :loading="loading.order" @update="updateColor")
      template(#footer)
        footer
          .secondary-actions &nbsp;
            sgs-button.default.back(:label="source === 'cart' || isCartOrder ? 'Back to Cart' : 'Back'" @click="goBack")
          .actions
            sgs-button.secondary(:icon="loading.cart ? 'progress_activity' : 'shopping_cart'" :iconClass="loading.cart ? 'spin' : ''" :label="`${ isCartOrder ? 'Update' : 'Add to' } cart`" @click="addToCart" :disabled="disableReorder")
              template(#badge)
                i(v-if="cartCount > 0" v-badge.danger="cartCount")
            sgs-button(:icon="loading.reorder ? 'progress_activity' : ''" :iconClass="loading.reorder ? 'spin' : ''" label="Re-Order Now" @click="reorder" :disabled="disableReorder")

  prime-dialog(v-model:visible="isCartMessageVisible" position="bottomleft" :style="{ width: '21rem' }" modal header="Add to Cart" :closable='false')
    .cart-message
      .icon
        span.material-icons.outline check_circle
      .details
        p {{ `Order ${ isCartOrder ? 'updated in' : 'added to'} cart successfully` }}
        div.cartDialog
          router-link(to="/cart") View Cart
          router-link(to="/dashboard") Close
</template>

<style lang="sass">
@import "@/assets/styles/includes"

.p-image-preview-indicator
  height: 4rem
  width: 4rem
  border-radius: 4rem
  max-width: 80%
  max-height: 80%
  margin: auto
  bottom: 0
  right: 0
  .p-icon
    max-width: 80%
    max-height: 80%

.p-image-mask
  z-index: $z-image-mask !important
.cartDialog
  +flex($h: right)
  gap: $s
  margin-top: $s2
  margin-right: $s
</style>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes slide
  0%
    transform: translateX(40vw)
  100%
    transform: translate(0)

.page.details
  +container
  .container
    +fixed-e
    width: 85vw
    min-width: 75rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    +container
    z-index: $z-popup-page
    animation: slide 0.2s ease-in
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
  .card
    padding: $s $s2
  .card.summary
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
      padding: 0 $s
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

.cart-message
  +flex
  align-items: flex-start
  height: 8rem
  .icon
    padding: $s
    padding-right: 0
    width: 5rem
    .material-icons
      color: darken($sgs-green, 10%)
      font-size: 3rem
  .details
    padding: $s
    flex: 1
</style>
