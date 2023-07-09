<script setup>
import { ref, computed } from 'vue'
import { get } from 'lodash'
import { DateTime } from 'luxon'

const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  },
  data: {
    type: Object,
    default: null
  },
})

const menu = ref()

const emit = defineEmits(['select','action'])

const items = computed(() => {

  return props.actions.map(action => {
    return {
      label: action.label,
      icon: action.icon,
      command: () => { emit('action', { event: action.event, data: props.data }) }
    }
  })
})

function formatDate(date) {
  return DateTime.fromJSDate(date).toFormat('dd LLL, yyyy h:mm a')
}

function resolvePath(config, data) {
  let path = config.path
  config.pathParams.forEach((param, i) => {
    const placeholder = `$${i + 1}`
    const value = get(data, param)
    path = path.replace(placeholder, value)
  })
  return path
}

function toggleMenu(event) {
  menu.value.toggle(event)
}
</script>

<template lang="pug">
span.table-action
  sgs-button.sm.default(icon="unfold_more" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu")
  prime-menu(ref="menu" id="overlay_menu" :model="items" popup)
    template(#item="{ item }")
      span.menu-item
        span.material-icons {{ item.icon }}
        span {{ item.label }}
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

span.menu-item
  +flex
  cursor: pointer
  padding: $s50 $s
  span.material-icons
    font-size: 20px
    padding: 0 $s50
</style>
