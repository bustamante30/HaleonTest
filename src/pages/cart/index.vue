<!-- eslint-disable vue/multi-word-component-names -->
<template lang="pug">
.page.cart
  sgs-mask
  .container
    sgs-scrollpanel
      template(#header)
        header
          h1.title Shopping Cart [{{ `${loading.count ? '...' : cartCount}` }}]
          a.close(@click="router.push('/dashboard')")
            span.material-icons.outline close
      sgs-spinner(v-if="loading.cart")
      .shopping-cart(v-else-if="cart")
        .orders
          cart-order(v-for="(order, i) in cart" :key="i" :order="order")
</template>

<script setup>
import { computed, onBeforeMount } from "vue";
import CartOrder from "@/components/cart/CartOrder.vue";
import { useCartStore } from "@/stores/cart";
import router from "@/router";

const cartStore = useCartStore();
const cart = computed(() => cartStore.cartOrders);
const cartCount = computed(() => cartStore.cartCount);
const loading = computed(() => cartStore.loading);

onBeforeMount(() => {
  cartStore.getCart().then((result) => {
    if (!result) router.push("/dashboard");
  });
});
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
    width: 85vw
    min-width: 75rem
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
  position: relative
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
