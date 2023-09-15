<template lang="pug">
data-table(:value="data" ref="dt" paginator :rows="rows" showGridlines)
    column(v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" )
    template(#empty)
        div No Audits found.
</template>
<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const rows = ref(10)
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const data = computed(()=> props.data)
const columns = ref([
  {
    field: 'auditTypeValue',
    header: 'Activity',
  },
  {
    field: 'auditData',
    header: 'Details',
  },
  {
    field: 'createdByUser',
    header: 'Created By',
  },
  {
    field: 'createdAt',
    header: 'Datetime',
  },
]);
</script>
