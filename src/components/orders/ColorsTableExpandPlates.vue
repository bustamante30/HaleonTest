<!-- eslint-disable vue/no-template-shadow -->
<template lang="pug">
.plates
  data-table.plate-details.p-datatable-sm(:value="data" :data-key="config.dataKey" :loading="data.length>0 && data[0].loading")
    column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :header-style="stylify(col.width)" :body-style="stylify(col.width)" :frozen="col.freeze ? true : false" :align-frozen="col.freeze")
      template(#body="{ data }")
        table-cell(v-if="col.field==='plateTypeId'" :config="col" :data="data" :data-key="config.dataKey" :options="data.plateList"  :empty="'Select Plate Type...'" @update="updatePlate")
        table-cell(v-else-if="col.field==='plateThicknessId'" :config="col" :data="data" :data-key="config.dataKey" :options="data.thicknessList" :empty="'Select Thickness...'" @update="updatePlate")
        table-cell(v-else :config="col" :data="data" :data-key="config.dataKey" @update="updatePlate")
    column
      template(#body="{ data }")
        sgs-button.sm.alert.secondary(:id="`remove-plate-${data[config?.dataKey]}`" icon="delete" @click="removePlate(data)")
  .actions
    sgs-button#add-plate.sm(icon="add" label="Add Plate Type" @click="addPlate")
</template>

<script lang="ts" setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TableCell from "@/components/ui/TableCell.vue";

const props = defineProps({
  colourId: {
    type: String,
    default: null,
  },
  config: {
    type: Object,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["update", "add", "remove"]);

function stylify(width) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}

function updatePlate({
  checkboxId,
  field,
  value,
}: {
  checkboxId: number;
  field: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}) {
  const { colourId } = props;
  // console.log('update plate', { colourId, checkboxId, field, value })
  if (colourId) emit("update", { colourId, checkboxId, field, value });
}

function addPlate() {
  const { colourId } = props;
  // console.log('add plate', { colourId })
  if (colourId) emit("add", { colourId });
}

function removePlate(plate) {
  const { checkboxId } = plate;
  const { colourId } = props;
  emit("remove", { colourId, checkboxId });
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.plates
  margin-left: 6rem
  .actions
    padding: $s50 0
</style>
