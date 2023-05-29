<script setup lang="ts">
import { useRoute } from "vue-router";
import OrderDetails from "@/components/orders/OrderDetails.vue"

const route = useRoute();
const id = route.params.id;
</script>

<template lang="pug">
.page.order-detail
  order-details(:selectedId="id")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

// .page.order-detail
</style>
