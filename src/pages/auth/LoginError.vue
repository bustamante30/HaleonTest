<script setup>
import AppLogo from "@/components/common/AppLogo.vue";
</script>

<template lang="pug">
.page.login
  app-logo.logo
  .login.form
    h3 Access Blocked. Sorry, you do not have permission to access this application.
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
  .form
    color: var(--text-color)
    width: 30rem
    min-height: 15rem
    background: white
    padding: $s3
    margin: 0 auto
    border-radius: 5px

  h3
    margin: 0 auto $s3
    text-align: center
    color: red

.footer
  clear: both
  padding: $s 0
</style>
