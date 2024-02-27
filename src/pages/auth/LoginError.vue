<script setup>
import AppLogo from "@/components/common/AppLogo.vue";
</script>

<template lang="pug">
.page.login
  app-logo.logo
  main
    h1 Having Trouble?
    p
      span You have not been authorized to access this application.
      br/
      span Please contact &nbsp;
      a(href="mailto: Support.Photon@SGSCO.com") Support.Photon@SGSCO.com 
      span &nbsp;or your internal Photon support administrator to access this application.
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
    width: 40rem
    min-height: 0rem
    padding: $s2
    margin: 0 auto $s
    text-align: center
    h1
      margin: 0 auto $s
      background: darken($sgs-red, 20%)
      color: $sgs-white
      padding: $s50 $s
    p
      span
        opacity: 0.9
      a
        color: #fff
        display: inline-block
</style>
