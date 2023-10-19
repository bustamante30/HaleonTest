<template lang="pug">
.page.login
  app-logo.logo
  h1 Login
  .login.form
    sgs-button#login-client.block(label="Login As A Client" @click="externallogin()")
    .external
      sgs-button#login-sgs.block(label="Login as SGS & Co User" @click="login()")
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { useRouter } from "vue-router";
import AppLogo from "@/components/common/AppLogo.vue";
import { useAuthStore } from "../stores/auth";
import { useB2CAuthStore } from "../stores/b2cauth";

const router = useRouter();
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

onMounted(async () => {
  // Clear the Storage on Login page  mount - to avoid using previously stored data
  localStorage.clear();
  sessionStorage.clear();
  authStore.resetLogin();
  authb2cStore.resetLogin();
});
function login() {
  router.push("/login");
}

function externallogin() {
  router.push("/b2clogin");
}
</script>

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
    min-height: 15rem
    background: white
    padding: $s3
    margin: 0 auto
    border-radius: 5px

.footer
  clear: both
  padding: $s 0
</style>
