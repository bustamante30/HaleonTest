<script setup>
import AppLogo from './AppLogo.vue'
import UserProfile from './UserProfile.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useCartStore } from "@/stores/cart";
import { useOrdersStore } from "@/stores/orders";
import { onMounted, computed, watch, ref } from "vue";
import store from "store";
import navigation from '@/data/config/app-navigation.js'


const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const cartCount = computed(() => cartStore.cartCount)
const currentUser = computed(() => authStore.currentUser);
const currentB2CUser = computed(() => authb2cStore.currentB2CUser);
const IsExternalAdmin = ref('');
const emit = defineEmits(['report', 'demo'])


const menu = computed(() => [...navigation(emit, IsExternalAdmin.value)])


onMounted(async () => {
  if (store.get('currentUser')) {
    authStore.currentUser = store.get('currentUser');
  }
  if (store.get('currentb2cUser')) {
    authb2cStore.currentB2CUser = store.get('currentb2cUser');
  }
});

watch(currentUser, async (value) => {
  if (authStore.currentUser) {
    ordersStore.userPrinterName = authStore.currentUser.printerName
    ordersStore.userRoleKey = authStore.currentUser.roleKey
    if (value.userType === 'INT' && value.roleKey=== 'PMSuperAdminUser') {
      IsExternalAdmin.value = 'PMSuperAdminUser';
    } else if (value.userType === 'INT' && value.roleKey === 'PMUser') {
      IsExternalAdmin.value = 'PMUser';
    } 
    await cartStore.getCartCount();
  }
});


watch(currentB2CUser, async (value) => {
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
    await cartStore.getCartCount();
  }
});
async function redirect(path){
  window.location.replace(path)
}
</script>

<template lang="pug">
header.app-header
  app-logo.logo(:size="1.5")
  .tools
    nav.app-navigation
      a.dashboardLink(@click="redirect('/dashboard')") Dashboard
      prime-menubar(:model="menu")
      span.separator
      .reorder-cart(v-tooltip.bottom="{ value: 'Reorder Cart' }")
        router-link.cart(to="/cart" v-badge.danger="cartCount")
          span.material-icons.outline shopping_cart      
    user-profile
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.app-header
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color) !important
  padding: $s50 0
  +flex-fill
  .logo
    margin: 0 $s 0 0
  h3
    line-height: 1
    margin: 0 0 $s25
    flex: 1

  nav
    +flex
    a.dashboard
      color: inherit
      font-weight: 700
      display: inline-block
      padding: 12px 16px
      border-radius: 2px
      line-height: 1
      font-size: 1rem
      &:hover
        background: rgba(#fff, 0.1) !important
        color: #fff

  a.cart
    display: inline-block
    margin-right: $s
    margin-top: $s50
    opacity: 0.9 !important
    &:hover
      opacity: 1 

  .tools, .nav
    +flex($h: right)
    > *
      margin: 0 $s
    a span
      color: #fff     
.dashboardLink
  font-weight: 600
  color: #FFFFFF
</style>
