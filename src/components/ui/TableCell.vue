<script setup>
import { get } from 'lodash'
import { DateTime } from 'luxon'
import {computed } from 'vue'
import SgsLookup from '@/components/ui/Lookup.vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => { }
  },
  data: {
    type: Object,
    default: null
  },
  options: {
    type: Object,
    default: () => {}
  }  
})

const emit = defineEmits(['update'])

const value = computed(() => get(props.data, props.config.field))
const isEditable = computed(() => get(props.data, 'isEditable'))
const id = computed(() => props.config && props.config.field ? props.config.field.replace(/\./ig, '_') : 'field')
const optionKey = computed(() => get(props.config, 'options.key') || null)
const optionValues = computed(() => optionKey.value ? get(props.options, optionKey.value) : [])
const optionLabelKey = computed(() => get(props.config, 'options.label') || 'label')
const optionValueKey = computed(() => get(props.config, 'options.value') || 'value')

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
  emit('update', { id: data.jobTechSpecColourId, field: config.field, value: value })
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
    prime-inputnumber.sm(showButtons buttonLayout="horizontal" :step="1" :min="0" :disabled="!value" :modelValue="value" @update:modelValue="update" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus")
  span(v-else-if="config.type === 'lookup'")
    sgs-lookup(:modelValue="value && value.value ? value.value : null" @update:modelValue="update" :options="optionValues" :optionLabel="optionLabelKey" :optionValue="optionValueKey" :edit="isEditable")
  span(v-else-if="config.tooltip" v-tooltip.top="{ value: value, disabled: !config.tooltip }") {{ value }}
  span(v-else :class="{ disabled:(value === null || value === '')}") {{ (value === null || value === '') ? 'N/A' : value }}

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
