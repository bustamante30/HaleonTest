<script setup>
import { computed, onBeforeMount, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppLogo from "@/components/common/AppLogo.vue";

const router = useRouter();



onMounted(async () => {
  // Clear the Storage on Login page  mount - to aviod using previously stored data 
  localStorage.clear();
  sessionStorage.clear();
})
function login() {
  router.push("/login");
}

function externallogin() {
  router.push("/b2clogin");
}
</script>

<template lang="pug">
.page.login
  app-logo.logo
  h1 Login
  .login.form
    sgs-button.block(label="Login as SGSCo User" @click="login()")
    .external
      sgs-button.block(label="Login as External User" @click="externallogin()")
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
    min-height: 15rem
    background: white
    padding: $s3
    margin: 0 auto
    border-radius: 5px

.footer
  clear: both
  padding: $s 0
</style>
