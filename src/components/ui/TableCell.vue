<script setup>
import { get } from 'lodash'
import { DateTime } from 'luxon'

const props = defineProps({
  config: {
    type: Object,
    default: () => { }
  },
  data: {
    type: Object,
    default: null
  },
})

const emit = defineEmits(['update'])

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

function update(value) {
  const { data, config } = props
  emit('update', { id: data.id, field: config.field, value: value })
}
</script>

<template lang="pug">
span.table-cell(:class="{ disabled: get(data, config.field) === 'NA' }")
  span.thumb(v-if="config.thumb")
    img(:src="get(data, config.thumb)")
  span(v-if="config.type === 'date'") {{ formatDate(get(data, config.field)) }}
  span(v-else-if="config.type === 'badge'")
    span.badge(v-if="get(data, config.field)" :class="get(data, config.field).key") {{ get(data, config.field).label }}
  span(v-else-if="config.type === 'link'")
    router-link(:to="resolvePath(config, data)") {{ get(data, config.field) }}
  span(v-else-if="config.type === 'image'")
    prime-image(:src="get(data, config.field)" alt="Image" preview :imageStyle="{ height: '2rem', width: 'auto', maxWidth: '100%' }")
  span(v-else-if="config.type === 'edit-sets'")
    prime-inputnumber.sm(showButtons buttonLayout="horizontal" :step="1" :min="0" :modelValue="get(data, config.field)" @update:modelValue="update" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus")
  span(v-else) {{ get(data, config.field) }}

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.table-cell
  +flex
  max-width: 100%
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  &.disabled
    opacity: 0.4


span.badge
  display: inline-block
  font-size: 0.8rem
  background: #EEE
  padding: $s25 $s50
  border-radius: 5px
  &.review
    background: #FEEA34
  &.cancel
    background: #D5D5D5
    color: #FFF
  &.confirmed
    background: #20CB84
    color: #FFF

span.thumb
  display: inline-block
  height: 1.25rem
  margin-right: $s50
  img
    height: 100%
    width: auto

a
  text-decoration: none
  color: darken(#2C78B5, 10%)
  &:hover
    color: #2C78B5
</style>
