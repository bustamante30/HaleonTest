<script setup>
import AppLogo from './AppLogo.vue'
import UserProfile from './UserProfile.vue'
</script>

<template lang="pug">
header.app-header
  app-logo.logo(:size="1.5")
  h3
    router-link(to="/dashboard") Image Carrier Re-Order
  .nav
    router-link(to="/dashboard") Dashboard
    router-link(to="/dashboard") Manage Users
    router-link(to="/dashboard") Help
  span.separator
  .tools
    //- router-link(to="/" v-tooltip.bottom="{ value: 'Manage Users' }")
    //-   span.material-icons.outline groups
    //- router-link(to="/" v-tooltip.bottom="{ value: 'Saved Orders' }")
    //-   span.material-icons.outline bookmark
    router-link(to="/cart" v-tooltip.bottom="{ value: 'Reorder Cart' }" v-badge.danger="4")
      span.material-icons.outline shopping_cart
    user-profile
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.app-header
  background: var(--app-header-bg-color)
  color: var(--app-header-text-color)
  padding: $s
  +flex-fill
  .logo
    margin: 0 $s 0 0
  h3
    line-height: 1
    margin: 0 0 $s25
    flex: 1
  a
    color: inherit
    font-weight: 700

  .tools, .nav
    +flex($h: right)
    > *
      margin: 0 $s
    a span
      color: #fff
</style>
