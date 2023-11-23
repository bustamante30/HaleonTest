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
  let changedList = false;
  if (event.value == -1) {
    if (!showFullList.value) {
      showFullList.value = true;
      displayOptions.value = props.alternateOptions;
    } else {
      showFullList.value = false;
      displayOptions.value = props.options;
    }
    changedList = true;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ///added workaround due to issue with prevention of event propagation in primevue
    throw new Error("changed List ");
  }
  if (!changedList) {
    emit("update:modelValue", event.value);
    editMode.value = false;
  }
}

function escPressed() {
  editMode.value = false;
}

function switchToEditMode() {
  editMode.value = true;
}
const showFullList = ref(props.alternateOptions.length === 0);
function checkValue(val) {
  return val.option[props.optionValue] === -1;
}
</script>

<template lang="pug">
.lookup(tabindex="0" @keydown.esc="escPressed")
  prime-dropdown(v-if="editMode" :model-value="modelValue" :options="[...defaultOptions, ...displayOptions]" :option-label="optionLabel" :option-value="optionValue" filter :placeholder="empty" @change="update($event)")
    template(#option="slotProps")
      span.blue(v-if="checkValue(slotProps)" class="flex align-items-center") {{ slotProps.option[optionLabel] }}
      span(v-else class="flex align-items-center") {{ slotProps.option[optionLabel] }}
  .readonly(v-if="!editMode" )
    span.value(v-if="selected") {{ selected[props.optionLabel] }}
    span.no-data(v-else) No value specified
    a.change(v-if="displayOptions && displayOptions.length>1" @click="switchToEditMode()") Change
  
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
.blue
  color: #0080C5
</style>
