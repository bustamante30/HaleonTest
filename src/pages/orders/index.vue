<!-- eslint-disable vue/multi-word-component-names -->
<template lang="pug">
.page.orders
  router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.orders
  +container
  main
    +container
    padding: $s
</style>
