<script setup>
import AppLogo from "@/components/common/AppLogo.vue";
</script>

<template lang="pug">
.page.login
  app-logo.logo
  main
    h1 Access Denied
    p
      | Sorry you do not have necessary permission
      br/
      | to access this application
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.login
  +container
  height: 100vh
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color)

  .logo
    margin: $s4 auto $s

  main
    width: 30rem
    min-height: 0rem
    padding: $s3
    margin: $s3 auto
    text-align: center
    h1
      margin: 0 auto $s
      background: darken($sgs-red, 20%)
      color: $sgs-white
      padding: $s50 $s
    p
      opacity: 0.9
</style>
