<script setup>
import AppLogo from "@/components/common/AppLogo.vue";
</script>

<template lang="pug">
.page.login
  app-logo.logo
  h1 Login Successful
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.login
  +container
  height: 100vh
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color)
  text-align: center

  .logo
    margin: $s4 auto $s

  h1
    margin: 0 auto $s3
    text-align: center
    width: 40rem
  .external
    padding-top: 3rem
  .form
    color: var(--text-color)
    width: 30rem
    min-height: 20rem
    background: white
    padding: $s3
    margin: 0 auto
    border-radius: 5px

.footer
  clear: both
  padding: $s 0
</style>
