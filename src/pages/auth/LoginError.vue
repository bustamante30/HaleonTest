<template lang="pug">
.page.login
  app-logo.logo
  main
    h1 Having Trouble?
    p(v-if = "externalUser")
      span You have not been authorized to access this application.
      br/
      span Please contact&nbsp;
      a(href="mailto: Support.Photon@SGSCO.com") Support.Photon@SGSCO.com 
      span &nbsp;or your internal Photon support administrator to access this application.
    p(v-else-if = "internalUser")
      span You have not been authorized to access this application.
      br/
      span Please contact&nbsp;
      a(:href="serviceNowUrl" target="_blank") SGS help desk
      span &nbsp;or your administrator to access this application.
</template>

<!-- eslint-disable no-undef -->
<script setup="ts">
import AppLogo from "@/components/common/AppLogo.vue";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";

const authStore = useAuthStore();
const b2cAuthStore = useB2CAuthStore();
const serviceNowUrl = import.meta.env.VITE_SERVICE_NOW_INTERNAL_URL;

const internalUser = computed(() => authStore.account);
const externalUser = computed(() => b2cAuthStore.account);
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.login
  +container
  height: 100vh
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color)
  display: flex
  flex-direction: column
  align-items: center

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
        text-decoration: underline
</style>
