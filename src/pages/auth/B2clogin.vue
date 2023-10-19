<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="b2cUserLoggedIn">
    <a>Please wait while we are loading profile information</a>
  </div>
  <div v-else>
    <a> Please wait you will be redirected to External login page....</a>
  </div>
</template>
<script setup="ts">
import { onMounted, watch, computed } from "vue";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useRouter } from "vue-router";

const authStore = useB2CAuthStore();
const router = useRouter();
const b2cUserLoggedIn = computed(() => authStore.currentB2CUser.isLoggedIn);
onMounted(async () => {
  if (authStore.currentB2CUser.isLoggedIn == false) {
    await authStore.login();
    if (authStore.currentB2CUser.isLoggedIn) {
      router.push({ name: "dashboard" });
    }
  } else {
    router.push({ name: "dashboard" });
  }
});

watch(b2cUserLoggedIn, () => {
  if (authStore.currentB2CUser.isLoggedIn) {
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
