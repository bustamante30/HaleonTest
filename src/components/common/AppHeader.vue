<script setup>
import AppLogo from './AppLogo.vue'
import UserProfile from './UserProfile.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useOrdersStore } from "@/stores/orders";
import { onBeforeMount, onMounted, computed } from "vue";
import store from "store";

const ordersStore = useOrdersStore()
const cartCount = computed(() => ordersStore.cartCount)
onMounted(async () => {
  if (store.get('currentUser')) {
    authStore.currentUser = store.get('currentUser');
  }
  if (store.get('currentb2cUser')) {
    authb2cStore.currentB2CUser = store.get('currentb2cUser');
  }
  await ordersStore.getCartCount()
});



  const authStore = useAuthStore();
  const authb2cStore = useB2CAuthStore();
  let userType = '';
  let userRole = '';

  if (authStore.currentUser.email !== '') {
    if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
      userType = authStore.currentUser.userType;
      userRole = authStore.currentUser.roleKey;
    }
  }

  if (authb2cStore.currentB2CUser.email !== '') {
    if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
      userType = authb2cStore.currentB2CUser.userType;
      userRole = authb2cStore.currentB2CUser.roleKey;
    }
  }

</script>

<template lang="pug">
header.app-header
  app-logo.logo(:size="1.5")
  h3
    router-link(to="/dashboard") Image Carrier Re-Order
  .nav
    router-link(to="/dashboard") Dashboard
    //- Use a ternary operator to conditionally set the link's text
    //- router-link(:to= "(userType === 'EXT' && userRole ==='PrinterAdmin') ?  '/users' : '/users?role=super'") {{ (userType === 'EXT' && userRole ==='PrinterAdmin') ?  'Manager Users' : 'Manage Users (As Super)' }}
    router-link(to="/users") Manage Users
    router-link(to="/users?role=super") Manage Users (As Super)
    router-link(to="/dashboard") Help
  span.separator
  .tools
    //- router-link(to="/" v-tooltip.bottom="{ value: 'Manage Users' }")
    //-   span.material-icons.outline groups
    //- router-link(to="/" v-tooltip.bottom="{ value: 'Saved Orders' }")
    //-   span.material-icons.outline bookmark
    router-link(to="/cart" v-tooltip.bottom="{ value: 'Reorder Cart' }" v-badge.danger="cartCount")
      span.material-icons.outline shopping_cart
    user-profile
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.app-header
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color) !important
  padding: $s
  +flex-fill
  .logo
    margin: 0 $s 0 0
  h3
    line-height: 1
    margin: 0 0 $s25
    flex: 1

  nav
    +flex
    gap: $s150
  a
    color: inherit
    font-weight: 700
    opacity: 0.8
    &:hover
      opacity: 1

  .tools, .nav
    +flex($h: right)
    > *
      margin: 0 $s
    a span
      color: #fff
</style>
