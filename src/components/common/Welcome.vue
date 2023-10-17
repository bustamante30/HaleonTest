<!-- eslint-disable vue/multi-word-component-names -->
<template lang="pug">
.p-message-info
  message.nomargin(:closable='true' sticky='' life=3000) Welcome To Image Carrier Reorder
</template>

<script setup>
import Message from "primevue/message";
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.nomargin
  margin-bottom: 0
</style>
