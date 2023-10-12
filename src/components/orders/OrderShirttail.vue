<script lang="ts" setup>
import { config } from "@/data/config/shirttail";
import { get } from "lodash";
import { useOrdersStore } from "@/stores/orders";
import { ref, computed, reactive, onMounted } from "vue";
import Dialog from "primevue/dialog";
import OrderBarcodes from "./OrderBarcodes.vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const ordersStore = useOrdersStore();
const selectedOrder = computed(() => ordersStore.selectedOrder);
const colors = computed(() => ordersStore.selectedOrder.colors);

function getFieldData(fieldName: string): any {
  console.log("selected orders", selectedOrder.value);
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

<template lang="pug">
.order-shirttail
  sgs-panel(v-for="(section, i) in config.sections" :header="section.label")
    order-barcodes(v-if="section && section.type === 'barcodes'" :config="section.tableConfig" :data="getFieldData('barcodes')")
    .fields(v-if="section && section.fields")
      .f(v-for="field in section.fields")
        label {{ field.label }}
        span.value {{ getFieldData(field.name) }}
    
</template>

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
