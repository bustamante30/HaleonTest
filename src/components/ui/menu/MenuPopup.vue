<script setup>
const props = defineProps({
  menuitem: {
    type: Object,
    default: null,
  },
});

const menu = ref();

function toggle(event) {
  menu.value.toggle(event);
}
</script>

<template lang="pug">
span.menu-button(v-if="menuitem")
  sgs-button.default(:label="menuitem.label" @click="toggle" aria-haspopup="true" aria-controls="overlay" icon="expand_more" icon-position="right")
  prime-menu(ref="menu" id="overlay" :model="menuitem.items" :popup="true")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

span.menu-button
  display: inline-block
  button
    border-radius: 2px
    font-weight: 700
    color: inherit !important
    border-color: transparent !important
    &:hover
      background: rgba(#fff, 0.1) !important
</style>
