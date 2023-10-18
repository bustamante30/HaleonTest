<!-- eslint-disable vue/no-template-shadow -->
<template lang="pug">
data-table.p-datatable-sm.location-table(:value="data" scrollable scroll-height="flex" paginator :rows="30" :class="className")
  column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :header-style="stylify(col.width)" :body-style="stylify(col.width)" :frozen="col.freeze ? true : false" :align-frozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" )
  column(v-if="config.actions" :header-style="stylify(4)" :body-style="stylify(4)" :frozen="true" align-frozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TableActions from "@/components/ui/TableActions.vue";
import TableCell from "@/components/ui/TableCell.vue";

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({ cols: [] }),
  },
  className: {
    type: String,
    default: null,
  },
});

function stylify(width) {
  return width
    ? { width: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.location-table
  header
    +flex-fill
</style>
