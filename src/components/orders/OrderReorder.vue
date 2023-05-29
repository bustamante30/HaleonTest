<script setup>
import { computed, onBeforeMount } from "vue";
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

onBeforeMount(() => {
  ordersStore.getOrders()
  colorsStore.getColors()
  ordersStore.getOrderById(props.selectedId)
})


const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);

function buy() {
  router.push(`/${props.selectedId}/confirm`)
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
            span Re-Order: {{ selectedOrder.name }}
          a.close(@click="router.push('/')")
            span.material-icons.outline close
      .card.summary(v-if="selectedOrder")
        .thumbnail
          prime-image(:src="selectedOrder.image" alt="Image" preview :imageStyle="{ height: '100%', width: 'auto', maxWidth: '100%' }")
        .details
          h4
            span {{ selectedOrder.brandName }}
          p
            span {{ selectedOrder.itemCode }}
            span.separator |
            span {{ selectedOrder.packType }}
          .printer
            h3 Printer
            p {{ selectedOrder.printerName }}
            p {{ selectedOrder.printerLocation }}
      .card
        colors-table(:config="config" :data="colors" isEditable="true")
      .card
        iframe.pdf(src="/7167141_2_SG1_PP_34346403_LR.pdf#view=fit")
      template(#footer)
        footer
          .actions
            sgs-button.default(label="Back" @click="router.push(`/${selectedId}`)")
            sgs-button(label="Place Order" @click="router.push(`/${selectedId}/confirm`)")
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
  z-index: 6001 !important
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
    width: 80vw
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    +container
    z-index: 5000
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
  footer
    padding: $s
    .actions
      +flex($h: right)
      > *
        margin-left: $s

iframe.pdf
  width: 100%
  min-height: 40rem
  margin: $s 0
  border: none
</style>
