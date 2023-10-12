<script setup>
import { ref, computed, watch } from "vue";
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

const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const initials = computed(() => {
  if (isUserLoggedIn.value) {
    if (
      authStore.currentUser &&
      authStore.currentUser.firstName &&
      authStore.currentUser.lastName
    ) {
      const firstLetterOfFirstName = authStore.currentUser.firstName.charAt(0);
      const firstLetterOfLastName = authStore.currentUser.lastName.charAt(0);

      return firstLetterOfFirstName + firstLetterOfLastName;
    }
  } else if (isb2cUserLoggedIn.value) {
    if (
      authb2cStore.currentB2CUser &&
      authb2cStore.currentB2CUser.firstName &&
      authb2cStore.currentB2CUser.lastName
    ) {
      const firstLetterOfFirstName =
        authb2cStore.currentB2CUser.firstName.charAt(0);
      const firstLetterOfLastName =
        authb2cStore.currentB2CUser.lastName.charAt(0);

      return firstLetterOfFirstName + firstLetterOfLastName;
    }
  }
  // Default value if any of the properties are null
  return "AB";
});

const isPopupVisible = ref(false);

function togglePopup() {
  isPopupVisible.value = !isPopupVisible.value;
}

async function logout() {
  if (isUserLoggedIn.value) {
    await authStore.logout();
  }
  if (isb2cUserLoggedIn.value) {
    await authb2cStore.logout();
  }
}

watch(
  () => [isUserLoggedIn, isb2cUserLoggedIn],
  ([]) => {},
);
</script>

<template lang="pug">
.user-profile
  span.avatar(@click="togglePopup()") {{ initials }}
  .mask(v-if="isPopupVisible" @click="togglePopup")
  .popup(v-if="isPopupVisible")
   h4 {{ authb2cStore.currentB2CUser.displayName ? authb2cStore.currentB2CUser.displayName : (authStore.currentUser.displayName || 'Hi User') }}
    h6 {{ authb2cStore.currentB2CUser.email ? authb2cStore.currentB2CUser.email : (authStore.currentUser.email ||'User@gmail.com') }}
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

  .mask
    +fixed
    background: rgba(0, 0, 0, 0.02)
    z-index: $z-user-profile - 1

  .popup
    +fixed-ne
    top: 3.5rem
    right: 1.5rem
    width: 21rem
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
