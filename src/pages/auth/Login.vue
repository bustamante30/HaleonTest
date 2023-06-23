<script setup="ts">
import { onMounted, reactive, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

const authStore = useAuthStore();

const userLoggedIn = reactive(() => authStore.currentUser.isLoggedIn);
onMounted(async () => {
  if (authStore.currentUser.isLoggedIn == false) {
    await authStore.login();
    if (authStore.currentUser.isLoggedIn) {
      router.push({ name: "dashboard" });
    }
  } else {
    router.push({ name: "dashboard" });
  }
});

watch(userLoggedIn, (value) => {
  if (authStore.currentUser.isLoggedIn) {
    router.push({ name: "dashboard" });
  }
});
</script>
<template>
  <div v-if="userLoggedIn">
    <a>Please wait while we are loading profile information</a>
  </div>
  <div v-else><a> Please wait you will be redirected to login page....</a></div>
</template>
<style scoped>
a {
  text-align: center;
  display: block;
}
@media (min-width: 1024px) {
}
</style>
