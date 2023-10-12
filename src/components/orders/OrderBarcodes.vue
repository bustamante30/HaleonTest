<script lang="ts" setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { ref, computed, reactive, onMounted } from "vue";

const props = defineProps({
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

function checkData(data: any) {
  console.log("Data prop received:", data);
}

// Lifecycle hook to call the checkData function after the component is mounted
onMounted(() => {
  checkData(props.data);
});
</script>

<template lang="pug">
.barcodes
  data-table.p-datatable-sm(:value="data" scrollable scrollHeight="300px")
    column(v-for="col, i in config.cols" :header="col.label" :headerStyle="columnStyle(col.width)" :bodyStyle="columnStyle(col.width)")
      template(#body="{ data }")
        span {{ data[col.name] }}
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.barcodes
  +container
  padding: $s
</style>
