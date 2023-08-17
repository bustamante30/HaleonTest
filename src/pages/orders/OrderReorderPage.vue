<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useRoute } from "vue-router"
import OrderReorder from "@/components/orders/OrderReorder.vue"
import { useOrdersStore } from "@/stores/orders";

const route = useRoute();
const id = route.params.id

const orderStore = useOrdersStore()

onBeforeMount(() => {
  orderStore.initReorderOptions()
})
</script>

<template lang="pug">
.page.order-detail
  order-reorder(:selectedId="id")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

// .page.order-detail
</style>
