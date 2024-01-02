<!-- eslint-disable vue/attribute-hyphenation --><!-- eslint-disable vue/no-template-shadow --><!-- eslint-disable vue/no-v-model-argument -->
<template lang="pug">
data-table.colors-table.p-datatable-sm(v-model:selection="selected" v-model:expandedRows="expandedRows" :value="sortedColors" scrollable scrollHeight="flex" :rows="30" :dataKey="config.dataKey" :loading="loading" :style="{ minHeight: '25rem'}")
  template(#header)
    .table-header
      sgs-button#expand-all.sm.secondary(v-if="!isExpanded" label="Expand All" icon="Add" @click="expandAll")
      sgs-button#collapse-all.sm.secondary(v-if="isExpanded" label="Collapse All" icon="Remove" @click="collapseAll")
  column(expander headerStyle="width: 3rem")
  column(v-if="isEditable" selectionMode="multiple" headerStyle="width: 3rem")
  column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
  template(#expansion="{ data }")
    colors-table-plates(:data="data.plateDetails" :config="config.plates" :plates="data.plateList" :thicknesses="data.thicknessList" :colourId="data.checkboxId" @add="addPlate" @remove="removePlate" @update="updatePlate")
</template>

<!-- eslint-disable no-undef --><!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { sum, sortBy } from "lodash";
import TableActions from "@/components/ui/TableActions.vue";
import TableCell from "@/components/ui/TableCell.vue";
import ColorsTablePlates from "./ColorsTableExpandPlates.vue";
import { useOrdersStore } from "@/stores/orders";
import { useRoute } from "vue-router";
const route = useRoute();

const ordersStore = useOrdersStore();

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

const selected = ref([] as never[]);
const expandedRows = ref([] as any[]);

const sortedColors = computed(() => sortBy(props.data, props.config.sortBy));
const isExpanded = ref(false);

onBeforeMount(() => {
  // When back from confirmation page, do not reset sets(quantity)
  const source = route.query && (route.query?.source as any);
  if (source !== "confirm" && source !== "cart") {
    props.data?.forEach((color: any) => {
      const { checkboxId } = color;
      color.plateDetails?.forEach((plateType: any) => {
        updatePlate({
          colourId: color.checkboxId,
          checkboxId: plateType.checkboxId,
          field: "sets",
          value: 0,
        });
      });
      updateColor({ checkboxId, field: "sets", value: 0 });
    });
  }
});

function stylify(width: any) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}

watch(selected, (colors, prevColors) => {
  if (prevColors) {
    const prevColorIds = (prevColors as any).map(
      (c: { checkboxId: any }) => c.checkboxId,
    );
    const colorIds = (colors as any).map(
      (c: { checkboxId: any }) => c.checkboxId,
    );
    // If color added sets = 1
    colors.forEach((color: any) => {
      const { checkboxId } = color;
      if (!(prevColorIds as any).includes(color.checkboxId)) {
        if (!color.totalSets)
          updateColor({ checkboxId, field: "sets", value: 1 });
      }
    });
    // If color removed sets = 0
    prevColors.forEach((color: any) => {
      const { checkboxId } = color;
      if (!colorIds.includes(color.checkboxId)) {
        updateColor({ checkboxId, field: "sets", value: 0 });
      }
    });
  }
});

watch(
  () => props.loading,
  () => {
    selected.value = props?.data?.filter((c: any) => {
      return c.totalSets > 0;
    }) as never[];
  },
);
function updateColor({ checkboxId, field, value }: any) {
  emit("update", { checkboxId, field, value });
}

function addPlate(params: any) {
  ordersStore.addPlate(params);
}

function removePlate(params: any) {
  ordersStore.removePlate(params);
}

function expandAll() {
  expandedRows.value = sortedColors.value.reduce(
    (acc, p) => ((acc as any)[(p as any).checkboxId] = true) && acc,
    {},
  ) as any;
  isExpanded.value = true;
}

function collapseAll() {
  expandedRows.value = null as any;
  isExpanded.value = false;
}

async function updatePlate(params: any) {
  await ordersStore.updatePlate(params);
  const isAlreadySelected = selected.value.find(
    (c: any) => c.checkboxId === params?.colourId,
  );
  if (params?.value) {
    const colour = props.data.find(
      (c: any) => c.checkboxId === params?.colourId,
    );
    if (selected && selected.value && !isAlreadySelected) {
      selected.value = [...(selected.value as any[]), colour] as never[];
    }
  } else {
    if (isAlreadySelected) {
      const colour = selected?.value?.find(
        (c: any) => c.checkboxId === params?.colourId,
      );
      const totalSets = sum(
        (colour as any)?.plateDetails?.map((plate: any) => plate?.sets) || [],
      );
      if (!totalSets)
        selected.value = selected?.value?.filter(
          (c: any) => c.checkboxId !== params?.colourId,
        ) as never[];
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colors-table
  header
    +flex-fill
  .table-header
    +flex($h: left)
    +flex-wrap
    gap: $s
  .actions
    +flex($h: right)
</style>
