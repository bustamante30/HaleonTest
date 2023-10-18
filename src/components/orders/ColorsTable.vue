<!-- eslint-disable vue/no-v-model-argument -->
<!-- eslint-disable vue/no-template-shadow -->
<template lang="pug">
data-table.colors-table(v-model:selection="selected" :value="sortedColors" scrollable scroll-height="flex" :rows="30" data-key="jobTechSpecColourId" :lazy="true" :loading="loading" :style="{ minHeight: '25rem'}")
  column(v-if="isEditable" selection-mode="multiple" header-style="width: 3rem")
  column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :header-style="stylify(col.width)" :body-style="stylify(col.width)" :frozen="col.freeze ? true : false" :align-frozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :header-style="stylify(4)" :body-style="stylify(4)" :frozen="true" align-frozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
</template>

<!-- eslint-disable no-undef -->
<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { sortBy } from "lodash";

import TableActions from "@/components/ui/TableActions.vue";
import TableCell from "@/components/ui/TableCell.vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({ cols: [] }),
  },
  isEditable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: () => false,
  },
});
const emit = defineEmits(["update"]);
const selected = ref([]);
const sortedColors = computed(() => sortBy(props.data, props.config.sortBy));

function stylify(width) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    const prevColorIds =
      prevColors && prevColors.map((c) => c.jobTechSpecColourId);
    const colorIds = colors.map((c) => c.jobTechSpecColourId);
    // If color added sets = 1
    colors.forEach((color) => {
      if (
        prevColorIds &&
        !prevColorIds.includes(color.jobTechSpecColourId) &&
        color.sets < 1
      ) {
        updateColor({
          checkboxId: color.jobTechSpecColourId,
          field: "sets",
          value: 1,
        });
      }
    });
    // If color removed sets = 0
    prevColors &&
      prevColors.forEach((color) => {
        if (!colorIds.includes(color.jobTechSpecColourId)) {
          updateColor({
            checkboxId: color.jobTechSpecColourId,
            field: "sets",
            value: 0,
          });
        }
      });
  }
});

function updateColor({ checkboxId, field, value }) {
  emit("update", { checkboxId, field, value });
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colors-table
  header
    +flex-fill
.spinning
  font-size: 1rem
  background-color: white
</style>
