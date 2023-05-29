<script setup>
import Image from "primevue/image";
import { computed, onBeforeMount } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from '@/components/orders/ColorsTable.vue'
import config from '@/data/config/color-table'
import router from '@/router'

import { useColorsStore } from '@/stores/colors'

const colorsStore = useColorsStore()

const colors = computed(() => colorsStore.colors)

const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
 });

onBeforeMount(() => {
  ordersStore.getOrders()
  colorsStore.getColors()
  ordersStore.getOrderById(props.selectedId)
});


const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);

function back() {
  router.push('/')
}
</script>

<template lang="pug">
.page.confirm
  .container
    .align
       h1 Thank you for your order
       h2 The following plate re-order has been placed
       .card
         h2 Client Name
         span {{ selectedOrder.brandName }}
       .card
         h2 Product Description
         span {{ selectedOrder.name }}
       .card
         h2 Item Code
         span {{ selectedOrder.itemCode }}
       .card
         h2 Printer
         span {{ selectedOrder.printerName }}
       .card
         h2 Printer Location
         span {{ selectedOrder.printerLocation }}
       .card
         h2 Pack Type
         span {{ selectedOrder.packType }}
       h2 The above order expected to be delivered on 21 May through BlueDart courier
    sgs-button(label="Back" @click="back()")
</template>

<style lang="sass" scoped>

</style>
