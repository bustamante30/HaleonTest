<script setup>
import AppLogo from './AppLogo.vue'
import UserProfile from './UserProfile.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useOrdersStore } from "@/stores/orders";
import { onMounted, computed, watch, ref } from "vue";
import store from "store";

const ordersStore = useOrdersStore()

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const cartCount = computed(() => ordersStore.cartCount)
const currentUser = computed(() => authStore.currentUser);
const currentB2CUser = computed(() => authb2cStore.currentB2CUser);
const IsExternalAdmin = ref('');

onMounted(async () => {
  if (store.get('currentUser')) {
    authStore.currentUser = store.get('currentUser');
  }
  if (store.get('currentb2cUser')) {
    authb2cStore.currentB2CUser = store.get('currentb2cUser');
  }
  await ordersStore.getCartCount()
});

watch(currentUser, (value) => {
  if (authStore.currentUser) {
    ordersStore.userPrinterName = authStore.currentUser.printerName
    ordersStore.userRoleKey = authStore.currentUser.roleKey
    if (value.userType === 'INT' && value.roleKey=== 'PMSuperAdminUser') {
      IsExternalAdmin.value = 'PMSuperAdminUser';
    } else if (value.userType === 'INT' && value.roleKey === 'PMUser') {
      IsExternalAdmin.value = 'PMUser';
    } 
  }
});


watch(currentB2CUser, (value) => {
  if (authb2cStore.currentB2CUser) {
    ordersStore.userPrinterName = authb2cStore.currentB2CUser.printerName
    ordersStore.userRoleKey = authb2cStore.currentB2CUser.roleKey
   if (value.userType === 'EXT' && value.roleKey === 'PrinterAdmin') {
      IsExternalAdmin.value = 'PrinterAdmin';
    } else if (value.userType === 'EXT' && value.roleKey=== 'PrinterUser') {
      IsExternalAdmin.value = 'PrinterUser';
    }
     else {
      IsExternalAdmin.value = '';
    }
  }
});

</script>

<template lang="pug">
header.app-header
  app-logo.logo(:size="1.5")
  h3
    router-link(to="/dashboard") Image Carrier Re-Order
  .nav
    router-link(to="/dashboard") Dashboard
    router-link(v-show="IsExternalAdmin === 'PrinterAdmin'" :to="'/users'") Manage Users
    router-link(v-show="IsExternalAdmin === 'PMSuperAdminUser'" :to="'/users?role=super'") Manage Users
    router-link(to="/dashboard") Help
  span.separator
  .tools
    router-link(to="/cart" v-badge.danger="cartCount")
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
