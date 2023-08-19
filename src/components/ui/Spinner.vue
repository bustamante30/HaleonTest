
<template lang="pug">
.spinner
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.spinner
  height: 2.5rem
  width: 2.5rem
  border-radius: 50%
  border: 5px solid rgba($sgs-gray, 0.1)
  border-top: 5px solid rgba($sgs-gray, 0.1)
  border-left: 5px solid rgba($sgs-gray, 0.1)
  border-right: 5px solid $sgs-gray
  border-bottom: 5px solid $sgs-gray
  animation-name: spin
  animation-duration: 3000ms
  animation-iteration-count: infinite
  animation-timing-function: linear
  +absolute
  &.sm
    height: 1rem
    width: 1rem
    border-width: 3px
</style>
