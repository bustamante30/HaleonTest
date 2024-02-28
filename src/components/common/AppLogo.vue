<template lang="pug">
.app-logo
  img(alt="SGS&Co" :style="`width: ${size * 5}rem`" src="https://images.squarespace-cdn.com/content/v1/5f60b79a4c12290fb7cadc4b/1604347069254-Z10X09OUPA4LQASCH1Z0/Brandmark_SGS+%26+CO-cropped-reverse.png?format=1500w")
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 2,
  },
});
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.app-logo
  display: inline-block
  img
    width: 120px
    aspect-ratio: auto 1500/235
</style>
