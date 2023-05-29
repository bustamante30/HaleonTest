<script setup>
import router from '@/router'
import AppLogo from '@/components/common/AppLogo.vue'

function login() {
  router.push('/')
}
</script>

<template lang="pug">
.page.login
  app-logo.logo
  h1 Welcome to Plate Re-order Portal
  .login.form
    .f
      label Username
      prime-inputtext.input
    .f
      label
      label Password
      prime-inputtext.input(type="password")
      a.forgot Forgot Password?
    .footer
      sgs-button.block(label="Login" @click="login()")
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

  h1
    margin: 0 auto $s3
    text-align: center
    width: 40rem

  .form
    color: var(--text-color)
    width: 30rem
    min-height: 20rem
    background: white
    padding: $s3
    margin: 0 auto
    border-radius: 5px
    a.forgot
      display: inline-block
      padding: $s50 0
      float: right
      clear: right

.f
  padding: $s25 0
  > label
    display: block
    margin-bottom: $s25
  > .input
    width: 100%

.footer
  clear: both
  padding: $s 0
</style>
