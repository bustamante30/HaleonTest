<template lang="pug">
.panel
  header.panel-header
    slot(name="header")
  main.panel-content(ref="content", :class="{ 'scroll': props.scroll }")
    slot
  footer.panel-footer
    slot(name="footer")
</template>

<script setup>
const props = defineProps({
  scroll: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.panel
  height: 100%
  width: 100%
  flex: 1
  display: flex
  flex-direction: column
  overflow: hidden
  align-items: stretch
  > header.panel-header,
  > footer.panel-footer
    margin: 0 !important
    padding: 0 !important
  > main.panel-content
    flex: 1
    overflow: hidden
    display: flex
    flex-direction: column
    &.scroll
      overflow-y: auto
      scroll-behavior: smooth
      scrollbar-color: transparent transparent
      scrollbar-width: thin
</style>
