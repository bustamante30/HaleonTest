<!-- eslint-disable no-undef -->
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
span.menu-button(v-if="props.menuitem")
  sgs-button.default(:id="`menu-button-${menuitem.label}`" :label="menuitem.label" icon="expand_more" icon-position="right"  @click="toggle")
  prime-menu(ref="menu" :model="menuitem.items" :popup="true")
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
