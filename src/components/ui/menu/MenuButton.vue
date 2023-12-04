<template lang="pug">
span.menu-button
  sgs-button.default(v-if="menuitem" :id="`menu-button-${menuitem.label}`" type="button" :label="menuitem.label" @click="action")
</template>

<script setup>
const props = defineProps({
  menuitem: {
    type: Object,
    default: null,
  },
});

function action() {
  if (props.menuitem) {
    if (props.menuitem.command) {
      props.menuitem.command();
    }
  }
}
</script>

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
