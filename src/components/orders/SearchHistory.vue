<script lang="ts" setup>
import { slice } from "lodash";
import { computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TableCell from "@/components/ui/TableCell.vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: { cols: [] },
  },
  limit: {
    type: Number,
    default: 5,
  },
});

const limitedData = computed(() => slice(props.data, 0, props.limit));

function stylify(width: number) {
  return width
    ? { width: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}
</script>

<template lang="pug">
data-table.p-datatable-sm.search-history(:value="limitedData" scrollable scrollHeight="flex" :rows="30")
  column(v-for="(col, i) in config.cols" :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.search-history
  display: block
</style>
