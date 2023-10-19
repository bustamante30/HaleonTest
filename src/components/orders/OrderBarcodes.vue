<!-- eslint-disable vue/no-template-shadow -->
<template lang="pug">
.barcodes
  data-table.p-datatable-sm(:value="data" scrollable scroll-height="300px")
    column(v-for="col, i in config.cols" :key=i :header="col.label" :header-style="columnStyle(col.width)" :body-style="columnStyle(col.width)")
      template(#body="{ data }")
        span {{ data[col.name] }}
</template>

<script lang="ts" setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => {},
  },
});

const columnStyle = (width: number) => {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
};
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.barcodes
  +container
  padding: $s
</style>
