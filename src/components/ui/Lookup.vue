<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, computed, onBeforeMount } from "vue";
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: "label",
  },
  optionValue: {
    type: String,
    default: "value",
  },
  edit: {
    type: Boolean,
    default: false,
  },
  empty: {
    type: String,
    default: "",
  },
  hasAlternateOptions: {
    type: Boolean,
    default: false,
  },
  alternateOptions: {
    type: Array,
    default: () => [],
  },
});

const defaultOptions = computed(() => {
  const { modelValue, options } = props;
  return modelValue && !options.length
    ? [{ label: modelValue, value: modelValue }]
    : [];
});

const displayOptions = ref(props.options);

const emit = defineEmits(["update:modelValue"]);

const selected = computed(() => {
  const { modelValue } = props;
  const allOptions = [...defaultOptions.value, ...displayOptions.value];
  if (allOptions && allOptions.length && modelValue) {
    const option = allOptions.find(
      (option) => option[props.optionValue] === modelValue,
    );
    return option ? option : null;
  } else {
    return null;
  }
});

let editMode = ref(false);

onBeforeMount(() => {
  editMode.value = props.edit;
});

function update(event) {
  emit("update:modelValue", event);
  editMode.value = false;
}

function escPressed() {
  editMode.value = false;
}

function switchToEditMode() {
  editMode.value = true;
}
const showFullList = ref(props.alternateOptions.length === 0);
function handleToggle() {
  showFullList.value = true;
  displayOptions.value = props.alternateOptions;
}
</script>

<template lang="pug">
.lookup(tabindex="0" @keydown.esc="escPressed")
  prime-dropdown(v-if="editMode" :model-value="modelValue" :options="[...defaultOptions, ...displayOptions]" :option-label="optionLabel" :option-value="optionValue" filter :placeholder="empty" @update:model-value="update")
  .readonly(v-if="!editMode" )
    span.value(v-if="selected") {{ selected[props.optionLabel] }}
    span.no-data(v-else) No value specified
    a.change(v-if="displayOptions.length>1" @click="switchToEditMode()") Change
  div.toggleList()
    a(v-if="editMode && hasAlternateOptions && !showFullList" @click="handleToggle()") Show full list
    span(v-else) &nbsp;
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
  a.change
    display: inline-block
    margin-left: $s
</style>
