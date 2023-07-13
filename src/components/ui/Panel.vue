<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  header: {
    type: String,
    default: null
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

let isExpanded = ref(props.expanded) as any

watch(() => props.expanded, (value) => {
  isExpanded.value = props.expanded
})

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template lang="pug">
.panel
  header.panel-header(@click="toggle")
    h4(v-if="header") {{ header }}
    slot(name="header")
    span.expander
      span.material-icons.outline(v-if="isExpanded") expand_less
      span.material-icons.outline(v-else) expand_more

  main.panel-content(v-if="isExpanded")
    slot
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.panel
  header.panel-header
    +flex-fill
    background: #f8f9fa
    border: solid #dee2e6
    border-width: 0 0 1px 0
    padding: $s50 0 $s50 $s
    cursor: pointer
    h4
      font-size: 1rem
      opacity: 0.8
    &:hover
      background: lighten($sgs-blue, 60%)
      h4
        opacity: 1
      span.expander
        opacity: 0.6
    span.expander
      font-size: 0.9rem
      display: inline-block
      margin-right: $s
      padding: 0
      +flex(center, center)
      opacity: 0.6

.panel.sm
  header.panel-header
    h4
      font-size: 0.9rem
    span.expander
      font-size: 0.8rem

</style>
