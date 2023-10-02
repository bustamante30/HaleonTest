<script setup>
import { ref, computed } from 'vue'
import { get } from 'lodash'
import { DateTime } from 'luxon'
import ReorderService from "@/services/ReorderService";

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
      validate:action.validate,
      field:action.field,
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

async function toggleMenu(event) {
  const removeIndex =  items.value.findIndex(x=>x.validate)
  if(removeIndex >= 0){

    const item =items.value[removeIndex]
    const submittedDate = props.data[item.field]
    const currentTime = DateTime.fromJSDate(new Date())
    const subTime = DateTime.fromMillis(new Date(submittedDate).getTime())
    const diff = currentTime.diff(subTime, ['minutes']).minutes
    if(diff > 10) {
      items.value.splice(removeIndex,1)
    const result = await ReorderService.submitReorder(order, 4, true)
   }
  }


  if(items.value.length > 0)
    menu.value.toggle(event)
}
</script>

<template lang="pug">
span.table-action(v-if="actions.length>0")
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
