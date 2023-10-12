<script setup>
defineProps({
  size: {
    type: Number,
    default: 2,
  },
});
</script>

<template lang="pug">
.app-logo(:style="`width: ${size * 5}rem`")
  img(src="https://images.squarespace-cdn.com/content/v1/5f60b79a4c12290fb7cadc4b/1604347069254-Z10X09OUPA4LQASCH1Z0/Brandmark_SGS+%26+CO-cropped-reverse.png?format=1500w")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.app-logo
  img
    max-width: 100%
    height: auto
</style>
