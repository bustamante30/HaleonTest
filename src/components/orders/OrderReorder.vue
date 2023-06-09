<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from './ColorsTable.vue'
import config from '@/data/config/color-table-edit'
import router from '@/router'

import { useColorsStore } from '@/stores/colors'

const colorsStore = useColorsStore()

const colors = computed(() => colorsStore.colors)

const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
})

const isCartMessageVisible = ref(false)
const cartCount = ref(0)

onBeforeMount(() => {
  ordersStore.getOrders()
  colorsStore.getColors()
  ordersStore.getOrderById(props.selectedId)
})


const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);

function buy() {
  router.push(`/dashboard/${props.selectedId}/confirm`)
}

function addToCart() {
  isCartMessageVisible.value = true
  cartCount.value = 1
}
</script>

<template lang="pug">
.page.details
  sgs-mask
  .container(v-if="selectedOrder")
    sgs-scrollpanel(:top="0")
      template(#header)
        header
          h1.title
            span Re-Order:&nbsp;
            span {{ selectedOrder.name }}
          a.close(@click="router.push('/dashboard')")
            span.material-icons.outline close
      //- .card.context
        .details
          h4
            span Item Code: {{ selectedOrder.itemCode }}
            span.separator |
            span {{ selectedOrder.packType }}
            span.separator |
            span {{ selectedOrder.printerName }}, {{ selectedOrder.printerLocation }}
      .card.summary(v-if="selectedOrder")
        .thumbnail
          prime-image(:src="selectedOrder.image" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
        .card.details
          .f
            label Item Code
            span {{ selectedOrder.itemCode }}
          .f
            label Client
            span {{ selectedOrder.brandName }}
          .f
            label Description
            span {{ selectedOrder.name }}
          .f
            label Pack Type
            span {{ selectedOrder.packType }}
          .f
            label Product Weight
            span {{ selectedOrder.weight }}
          .f
            label Printer
            span {{ selectedOrder.printerName }}
            span.separator /
            span {{ selectedOrder.printerLocation }}
      .card
        colors-table(:config="config" :data="colors" isEditable="true")
      template(#footer)
        footer
          .secondary-actions &nbsp;
            sgs-button.default.back(label="Back" @click="router.push(`/dashboard/${selectedId}`)")
          .actions
            sgs-button.secondary(icon="shopping_cart" label="Add To Cart" @click="addToCart")
              template(#badge)
                i(v-if="cartCount > 0" v-badge.danger="cartCount")
            sgs-button(label="Re-Order Now" @click="router.push(`/dashboard/${selectedId}/confirm`)")

  prime-dialog(v-model:visible="isCartMessageVisible" position="bottomleft" :style="{ width: '25rem', height: '10rem' }" modal header="Add to Cart" @close="")
    .cart-message
      .icon
        span.material-icons.outline check_circle
      .details
        p Order added to cart successfully
        p
          router-link(to="/cart") View Cart
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
    width: 60vw
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
  .icon
    padding: $s
    padding-right: 0
    width: 5rem
    .material-icons
      color: darken($sgs-green, 10%)
      font-size: 3rem
  .details
    padding: $s
</style>
