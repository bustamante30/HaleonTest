<script setup>
import router from "@/router";

const props = defineProps({
  menuitem: {
    type: Object,
    default: null,
  },
});

function action() {
  if (props.menuitem) {
    if (props.menuitem.to) {
      router.push(props.menuitem.to);
    } else if (props.menuitem.command) {
      props.menuitem.command();
    }
  }
}
</script>

<template lang="pug">
span.menu-button
  sgs-button.default(type="button" :label="menuitem.label" @click="action")
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
