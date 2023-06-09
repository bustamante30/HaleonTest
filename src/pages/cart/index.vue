<template lang="pug">
.page.cart
  sgs-mask
  .container
    sgs-scrollpanel
      template(#header)
        header
          h1.title Shopping Cart
          a.close(@click="router.push('/dashboard')")
            span.material-icons.outline close
      .shopping-cart
        .orders
          cart-order(v-for="(order, i) in cart" :order="order")
        .checkout


</template>

<script setup>
import { computed, onBeforeMount } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import CartOrder from '@/components/cart/CartOrder.vue'
import { useOrdersStore } from '@/stores/orders'
import { useColorsStore } from '@/stores/colors'
import router from '@/router'

const colorsStore = useColorsStore()
const ordersStore = useOrdersStore()
const cart = computed(() => ordersStore.cart)

onBeforeMount(() => {
  colorsStore.getColors()
  ordersStore.getOrders()
})
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes slide
  0%
    transform: translateX(40vw)
  100%
    transform: translate(0)

.page.cart
  .container
    +fixed-e
    +container
    width: 70vw
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    z-index: $z-popup-page
    animation: slide 0.2s ease-in
    header
      +flex-fill
      background: rgba($sgs-gray, 0.1)
      padding: $s50 $s
      a.close
        opacity: 0.6
        span.material-icons
          color: $sgs-gray
        &:hover
          opacity: 1

.shopping-cart
  +flex
  .orders
    flex: 1
  // .checkout
  //   width: 30rem
  //   margin: 0 $s

.orders
  background: #fff
  padding: $s
</style>
