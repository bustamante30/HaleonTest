<template lang="pug">
.page.success
  sgs-mask
  .container
    // eslint-disable-next-line vue/attribute-hyphenation
    success-details(:selectedId="id")
</template>

<script setup>
import { useRoute } from "vue-router";
import SuccessDetails from "@/components/orders/OrderSuccess.vue";
const route = useRoute();
const id = route.params.id;
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes slide
  0%
    transform: translateX(40vw)
  100%
    transform: translate(0)

.page.success
  .container
    +fixed-e
    +container
    width: 85vw
    min-width: 75rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    z-index: $z-popup-page
    animation: slide 0.2s ease-in
</style>
