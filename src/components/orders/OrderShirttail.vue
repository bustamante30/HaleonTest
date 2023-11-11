<template lang="pug">
.order-shirttail
  sgs-panel(v-for="(section, i) in config.sections" :key=i :header="section.label")
    order-barcodes(v-if="section && section.type === 'barcodes'" :config="section.tableConfig" :data="getFieldData('barcodes')")
    .fields(v-if="section && section.fields")
      .f(v-for="(field, j) in section.fields" :key=j)
        label {{ field.label }}
        span.value {{ getFieldData(field.name) }}
</template>

<script lang="ts" setup>
import { config } from "@/data/config/shirttail";
import { get } from "lodash";
import { useOrdersStore } from "@/stores/orders";
import { computed } from "vue";
import OrderBarcodes from "./OrderBarcodes.vue";
const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);

function getFieldData(fieldName: string) {
  const fieldValue = get(selectedOrder.value, fieldName);
  if (fieldValue === null || fieldValue === "") {
    return "N/A";
  }
  if (fieldName === "surfaceReverseSprint") {
    if (typeof fieldValue === "number") {
      if (fieldValue === 1) {
        return "Reverse";
      } else if (fieldValue === 0) {
        return "Surface";
      } else if (fieldValue === 2) {
        return "Both";
      } else if (fieldValue === -1) {
        return "N/A";
      }
    }
  }

  return get(selectedOrder.value, fieldName);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.order-shirttail
  padding: $s
  .fields
    display: grid
    grid-template-columns: repeat(4, 1fr)
    gap: $s25 $s
    min-height: 0
    min-width: 0
    padding: $s
    .f
      overflow: hidden
      min-width: 0
      label
        font-size: 0.9rem
        margin-bottom: $s25
      span.value
        font-size: 0.9rem
        font-weight: 600
        display: inline-block
        width: 100%
        text-overflow: ellipsis
        white-space: nowrap
        overflow: hidden
</style>
