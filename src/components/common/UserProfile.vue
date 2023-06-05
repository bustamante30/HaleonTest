<script setup>
import { ref } from "vue";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({ initials: "AL" }),
  },
});

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

const isPopupVisible = ref(false);

function togglePopup() {
  isPopupVisible.value = !isPopupVisible.value;
}

async function logout() {
  if (authStore.currentUser.isLoggedIn) {
    await authStore.logout();
  }
  if (authb2cStore.currentB2CUser.isLoggedIn) {
    await authb2cStore.logout();
  }
  // router.push('/')
}
</script>

<template lang="pug">
.user-profile
  a.avatar(@click="togglePopup()") {{ user.initials }}
  .popup(v-if="isPopupVisible")
    h4 Abraham Lincoln
    p Purchase Manager, ABC Inc
    footer
      sgs-button.sm(label="Logout" @click="logout()")

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.user-profile
  .avatar
    background: $sgs-green
    color: $sgs-black
    display: inline-block
    width: 2rem
    height: 2rem
    border-radius: 2rem
    line-height: 1.85rem
    font-size: 1rem
    font-weight: 600
    text-align: center

  .popup
    +fixed-ne
    top: 3.5rem
    right: 1.5rem
    width: 20rem
    height: 10rem
    background: white
    box-shadow: 0 5px 5px 3px rgba(0, 0, 0, 0.1)
    padding: $s
    z-index: 1000
    color: $sgs-black
    footer
      padding-top: $s
      border-top: 1px solid #EEE
      +flex($h: right)
</style>
