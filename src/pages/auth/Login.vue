<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="userLoggedIn">
    <a>Please wait while we are loading profile information</a>
  </div>
  <div v-else><a> Please wait you will be redirected to login page....</a></div>
</template>

<script setup="ts">
import { onMounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

const authStore = useAuthStore();

const userLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
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

watch(userLoggedIn, () => {
  if (authStore.currentUser.isLoggedIn) {
    router.push({ name: "dashboard" });
  }
});
</script>
<style scoped>
a {
  text-align: center;
  display: block;
}
@media (min-width: 1024px) {
}
</style>
