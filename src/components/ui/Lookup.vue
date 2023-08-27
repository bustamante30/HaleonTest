<script setup>
import { ref, computed, onBeforeMount } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  edit: {
    type: Boolean,
    default: false
  }
})

const defaultOptions = computed(() => {
  const { modelValue, options } = props
  return modelValue && !options.length ? [{ label: modelValue, value: modelValue }] : []
})

const emit = defineEmits(['update:modelValue'])

const selected = computed(() => {
  const { options, modelValue } = props
  const allOptions = [...defaultOptions.value, ...options]
  if (allOptions && allOptions.length && modelValue) {
    const option = allOptions.find(option => option?.value === modelValue)
    return option ? option : null
  } else {
    return null
  }
})

let editMode = ref(false)

onBeforeMount(() => {
  editMode.value = props.edit
})

function update(event) {
  emit('update:modelValue', event)
  editMode.value = false
}

function escPressed(event) {
  editMode.value = false
  // console.log(event)
}

function switchToEditMode() {
  // console.log('switching to edit ' + props.modelValue)
  editMode.value = true
}
</script>

<template lang="pug">
.lookup(tabindex="0" @keydown.esc="escPressed")
  prime-dropdown(v-if="editMode" :modelValue="modelValue" @update:modelValue="update" :options="[...defaultOptions, ...options]" :optionLabel="optionLabel" :optionValue="optionValue" filter placeholder="Select Plate Type...")
  .readonly(v-else)
    span.value(v-if="selected") {{ selected.label }}
    span.value(v-else-if="modelValue === 256") Mixed
    span.no-data(v-else) No value specified
    a.change(@click="switchToEditMode()") Change
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.lookup
  width: 100%
  &:focus
    border: none
    outline: none
  .readonly
    +flex
    a.change
      display: inline-block
      margin-left: $s
</style>
