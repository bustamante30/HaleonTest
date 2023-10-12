<script setup>
import { get } from "lodash";
import { DateTime } from "luxon";
import { computed } from "vue";
import SgsLookup from "@/components/ui/Lookup.vue";
import router from "@/router";
import ReorderService from "@/services/ReorderService";
import { useNotificationsStore } from "@/stores/notifications";

const props = defineProps({
  config: {
    type: Object,
    default: () => {},
  },
  data: {
    type: Object,
    default: null,
  },
  dataKey: {
    type: String,
    default: "id",
  },
  options: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["update", "ordervalidation"]);
const notificationsStore = useNotificationsStore();

const value = computed(() => get(props.data, props.config.field));
// const id = computed(() => props.config && props.config.field ? props.config.field.replace(/\./ig, '_') : 'field')
const optionKey = computed(() => get(props.config, "options.key") || null);
const optionValues = computed(() =>
  optionKey.value ? get(props.options, optionKey.value) : [],
);
const optionLabelKey = computed(
  () => get(props.config, "options.label") || "label",
);
const optionValueKey = computed(
  () => get(props.config, "options.value") || "value",
);

function formatDate(date) {
  return DateTime.fromJSDate(date).toFormat("dd LLL, yyyy h:mm a");
}

function resolvePath(config, data) {
  let path = config.path;
  config.pathParams.forEach((param, i) => {
    const placeholder = `$${i + 1}`;
    const value = get(data, param);
    path = path.replace(placeholder, value);
  });
  return path;
}

function update(value) {
  const { data, config } = props;
  emit("update", {
    [props.dataKey]: data[props.dataKey],
    field: config.field,
    value: value,
  });
}

async function navigate(config, data) {
  if (
    (data.originalOrderId != undefined || data.sgsId != undefined) &&
    data.orderStatus === "Completed"
  ) {
    let jobNumber = "";
    if (data.originalOrderId != null) {
      jobNumber = data.originalOrderId;
    } else if (data.sgsId != null) {
      jobNumber = data.sgsId;
    }

    emit("ordervalidation", {
      originalOrderId: jobNumber,
      path: resolvePath(config, data),
    });
  } else {
    const link = resolvePath(config, data);
    router.push(link);
  }
}
</script>

<template lang="pug">
span.table-cell(:class="{ disabled: get(data, config.field) === 'NA' }" :title="config.title ? get(data, config.field) : null")
  span.thumb(v-if="config.thumb")
    img(:src="get(data, config.thumb)")
  span(v-if="config.type === 'date'") {{ formatDate(get(data, config.field)) }}
  span(v-else-if="config.type === 'badge'")
    span.badge(v-if="get(data, config.field)" :class="get(data, config.field).key") {{ get(data, config.field).label }}
  span(v-else-if="config.type === 'link'")
    a(@click="navigate(config, data)") {{ get(data, config.field) }}
  span.image(v-else-if="config.type === 'image'")
    prime-image(:src="get(data, config.field)" alt="Image" preview :imageStyle="{ height: '2rem', width: 'auto', maxWidth: '100%', 'aspect-ratio': 'auto 640 / 360' }")
  span(v-else-if="config.type === 'edit-sets'")
    prime-inputnumber.sm(showButtons buttonLayout="horizontal" :step="1" :min="0" :max="config.max" :modelValue="value" @update:modelValue="update" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus")
  span(v-else-if="config.type === 'lookup'")
    sgs-lookup(:modelValue="value && value.value ? value.value : null" :edit="data.isEditable" @update:modelValue="update" :options="optionValues" :optionLabel="optionLabelKey" :optionValue="optionValueKey")
  span(v-else-if="config.tooltip" v-tooltip.top="{ value: value, disabled: !config.tooltip }") {{ value }}
  span(v-else :class="{ disabled:(value === null || value === '' || value === undefined)}") {{ (value === null || value === '' || value === undefined) ? 'N/A' : value }}

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.table-cell
  +flex
  width: 100%
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  &.disabled
    opacity: 0.4
  > span
    display: inline-block
    width: 100%


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
  background: #999
  border: 1px solid #333
  margin-right: $s50
  img
    height: 100%
    width: auto

span.image > *

  min-height: 1.25rem
  background: #999
  border: 1px solid #333

  img
    height: 100%
    width: auto

a
  text-decoration: none
  color: darken(#2C78B5, 10%)
  &:hover
    color: #2C78B5
</style>
