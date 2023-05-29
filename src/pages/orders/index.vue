<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<template lang="pug">
.page.orders
  router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.orders
  +container
  main
    +container
    padding: $s
</style>
