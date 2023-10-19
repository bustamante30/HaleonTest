<script setup lang="ts">
import { useRoute } from "vue-router";
import OrderReorder from "@/components/orders/OrderReorder.vue";

const route = useRoute();
const id = route.params.id;
</script>

<template lang="pug">
.page.order-detail
  // eslint-disable-next-line vue/attribute-hyphenation
  order-reorder(:selectedId="id")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
</style>
