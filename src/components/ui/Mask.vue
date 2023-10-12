<template lang="pug">
.mask(@click="$emit('toggle')")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.mask
  +fixed
  background: var(--mask-bg-color)
  backdrop-filter: blur(3px)
  z-index: $z-mask
</style>
