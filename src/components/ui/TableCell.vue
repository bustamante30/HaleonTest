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
    prime-image(:src="get(data, config.field)" alt="Image" preview :image-style="{ height: '2rem', width: 'auto', maxWidth: '100%', 'aspect-ratio': 'auto 640 / 360' }")
  span.image(v-else-if="config.type === 'lenimage'")
    prime-image(:src="get(data, config.field)" alt="Image" preview :image-style="{ height: '2rem', width: 'auto', maxWidth: '100%', 'aspect-ratio': 'auto 640 / 360' }")
      template('#preview'='slotProps')
        //<img src="/image.jpg" alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
        v-image-magnifier(
          :cursor-none="false"
          :style="slotProps.style"
          :src="get(data, config.field)"
          :zoom-size="350" 
          :zoom-factor="2" :magnified-border-radius="0" :fit-content="false" @click="slotProps.onClick"
          class="magnifierpreview")
        //image-magnifier(src="https://unpkg.com/vue-image-magnifier@0.1.1/example/img/DA2D9393-4081-4384-B493-95DA1620C26D.png" zoom-src="https://unpkg.com/vue-image-magnifier@0.1.1/example/img/DA2D9393-4081-4384-B493-95DA1620C26D.png" width="100" height="75" zoom-width="400" zoom-height="300" mask-width="20" mask-height="20" :style="slotProps.style" @click="slotProps.onClick")
    
  span(v-else-if="config.type === 'edit-sets'")
    prime-inputnumber.sm(show-buttons button-layout="horizontal" :step="1" :min="0" :max="config.max" :model-value="value" increment-button-icon="pi pi-plus" decrement-button-icon="pi pi-minus" @update:model-value="update")
  span(v-else-if="config.type === 'lookup'")
    sgs-lookup(:model-value="value" :edit="data.isEditable" :options="options" :option-label="optionLabelKey" :option-value="optionValueKey" :empty="empty" @update:model-value="update")
  span(v-else-if="config.tooltip" v-tooltip.top="{ value: value, disabled: !config.tooltip }") {{ value }}
  span(v-else :class="{ disabled:(value === null || value === '' || value === undefined)}") {{ (value === null || value === '' || value === undefined) ? 'N/A' : value }}

</template>

<script setup>
import { get } from "lodash";
import { DateTime } from "luxon";
//import Vue from 'vue';
import { computed } from "vue";
import SgsLookup from "@/components/ui/Lookup.vue";
import router from "@/router";

//Vue.use(ImageMagnifier);
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
    type: Array,
    default: () => [],
  },
  empty: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update", "ordervalidation"]);
const value = computed(() => get(props.data, props.config.field));
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
    config.pathParams = [];
    if (data.originalOrderId != null) {
      jobNumber = data.originalOrderId;
      config.pathParams.push("originalOrderId");
    } else if (data.sgsId != null) {
      config.pathParams.push("sgsId");
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

.magnifierpreview
  cursor: zoom-in
</style>
