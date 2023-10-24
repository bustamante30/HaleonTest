<!-- eslint-disable vue/multi-word-component-names -->
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
  // eslint-disable-next-line vue/no-v-for-template-key
  template(v-for="menuitem, i in props.menu" :key="i")
    menu-popup(v-if="menuitem.items" :key="'popup-'+i" :menuitem="menuitem")
    menu-button(v-else :key="'button-' + i" :menuitem="menuitem")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.menu
  display: inline-block
</style>
