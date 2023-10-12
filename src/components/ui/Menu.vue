<script setup>
import MenuButton from "./menu/MenuButton.vue";
import MenuPopup from "./menu/MenuPopup.vue";

const props = defineProps({
  menu: {
    type: Array,
    default: () => [],
  },
});
</script>

<template lang="pug">
.menu
  template(v-for="menuitem, i in menu" :key="i")
    menu-popup(v-if="menuitem.items" :menuitem="menuitem")
    menu-button(v-else="menuitem.items" :menuitem="menuitem")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.menu
  display: inline-block
</style>
