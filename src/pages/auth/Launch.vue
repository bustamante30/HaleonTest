<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="userLoggedIn || b2cUserLoggedIn">
    <a>Please wait while we are loading profile information</a>
  </div>
  <div v-else><a> Please wait you will be redirected to login page....</a></div>
</template>

<script setup="ts">
import { onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import router from "@/router";
import { useRoute } from "vue-router";
const authStore = useAuthStore();
const b2cAuthStore = useB2CAuthStore();
const route = useRoute();
const userLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
onMounted(async () => {
  clearLogin();
  let userType = route.query.userType;
  let user;
  if (userType && userType == "EXT" && route.query.hint) {
    await b2cAuthStore.ssoLogin(route.query.hint);
    user = b2cAuthStore.currentB2CUser;
  } else if (userType && userType == "INT") {
    await authStore.login();
    user = authStore.currentUser;
  }
  if (user && user.isLoggedIn) {
    router.push({ name: "dashboard" });
  }
});

function clearLogin() {
  authStore.resetLogin();
  b2cAuthStore.resetLogin();
}
</script>
<style scoped>
a {
  text-align: center;
  display: block;
}
@media (min-width: 1024px) {
}
</style>
