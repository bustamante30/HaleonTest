<!-- eslint-disable vue/attribute-hyphenation --><!-- eslint-disable vue/no-template-shadow --><!-- eslint-disable vue/no-v-model-argument -->
<template lang="pug">
data-table.colors-table.p-datatable-sm(v-model:selection="selected" v-model:expandedRows="expandedRows" :value="sortedColors" scrollable scrollHeight="flex" :rows="30" :dataKey="config.dataKey" :loading="loading" :style="{ minHeight: '25rem'}")
  column(expander headerStyle="width: 3rem")
  column(v-if="isEditable" selectionMode="multiple" headerStyle="width: 3rem")
  column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" @update="updateColor")
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data")
  template(#expansion="{ data }")
    colors-table-plates(:data="data.plateDetails" :config="config.plates" :plates="getPlates(data)" :thicknesses="data.thicknessList" :colourId="data.checkboxId" @add="addPlate" @remove="removePlate" @update="updatePlate")
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
import { onBeforeMount } from "vue";
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
const expandedRows = ref([] as never[]);

const sortedColors = computed(() => sortBy(props.data, props.config.sortBy));

onBeforeMount(() => {
  // When back from confirmation page, do not reset sets(quantity)
  const source = route.query && (route.query?.source as any);
  if (source !== "confirm" && source !== "cart") {
    props.data?.forEach((color: any) => {
      const { checkboxId } = color;
      color.plateType?.forEach((plateType: any) => {
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
  selected.value = props?.data?.filter((c: any) => {
    return c.totalSets;
  }) as never[];
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

function getPlates(datos) {
  if (datos["useFullList"]) return datos["fullPlateList"];
  else return datos["plateList"];
}
function updateColor({ checkboxId, field, value }: any) {
  emit("update", { checkboxId, field, value });
}

function addPlate(params: any) {
  ordersStore.addPlate(params);
}

function removePlate(params: any) {
  ordersStore.removePlate(params);
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
        (colour as any)?.plateType?.map((plate: any) => plate?.sets) || [],
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

  .actions
    +flex($h: right)
</style>
