<template lang="pug">
.filter-tokens
  template(v-for="token in tokens")
    .token(v-if="token && token.value && (token.type === 'imageCarrierCodeType' ? token.code : true)" )
      label {{ token.short }}
      span.value(v-if="token.type === 'imageCarrierCodeType'") {{ token.value.type }} - {{ token.value.code }}
      span.value(v-else) {{ token.value }}
      a.clear
        span.material-icons.outline cancel
</template>

<script setup>
const props = defineProps({
  tokens: {
    type: Array,
    defult: () => []
  }
})
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.filter-tokens
  +flex
  gap: $s25
  padding: $s50
  .token
    +flex-fill
    background: rgba($sgs-black, 0.1)
    padding: $s25 $s50 $s25 $s
    border-radius: 15px
    border: 1px solid rgba($sgs-black, 0.1)
    font-size: 0.9rem
    font-weight: 500
    font-weight: 500
    label:after
      content: ":"
      margin-right: $s25
    span.value
      font-weight: 600
      flex: 1
    span.material-icons
      color: $sgs-black
      font-size: 0.9rem
      opacity: 0.5
      margin-left: $s50
      &:hover
        opacity: 1

</style>
