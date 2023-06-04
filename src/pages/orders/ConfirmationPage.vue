<script setup>
import { useRoute } from 'vue-router'
import router from '@/router'
import ConfirmDetails from '@/components/orders/OrderConfirm.vue'

const route = useRoute()

const id = route.params.id


</script>

<template lang="pug">
.page.order-confirm
  sgs-mask
  .container
    confirm-details(:selectedId = "id")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.order-confirm
  .container
    +fixed-e
    +container
    width: 60vw
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    z-index: 6000
</style>
