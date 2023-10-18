<template lang="pug">
.colours-table.edit
  data-table.p-datatable-sm(:value="colours")
    template(#header)
      header
        h4 Colours
        .actions
          sgs-button#add-color.sm.secondary(icon="add" label="Add Colour" @click="addColour")
    column()
      template(#header)
        label(:class="{ required: isMandatory }") Colour Name
      template(#body="{ data }")
        prime-inputtext.sm(v-model="data.name" placeholder="Enter color name" @change="emit('update', colours)")
    column()
      template(#header)
        label(:class="{ required: isMandatory }") Plate Type
      template(#body="{ data }")
        prime-dropdown#plate-type(v-model="data.plateType" name="plate_type" :options="sendToPmstore.imageCarrierPlateTypes" option-label="plateTypeName" option-value="plateTypeName" placeholder="Select plate type"  @change="emit('update', colours)")
    column( :header-style="stylify(5)" :body-style="stylify(5)")
      template(#header)
        label(:class="{ required: isMandatory }") Quantity
      template(#body="{ data }")
        prime-inputnumber.sm(v-model="data.quantity" show-buttons button-layout="horizontal" :step="1" :min="1" :max="10" increment-button-icon="pi pi-plus" decrement-button-icon="pi pi-minus" @change="emit('update', colours)")
    column(:header-style="stylify(2)" :body-style="stylify(2)")
      template(#body="{ data }")
        .actions
          sgs-button.sm.alert.secondary(:id="`remove-color-${data?.id}`" icon="delete" @click="removeColour(data)")
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any --><!-- eslint-disable no-undef -->
<script lang="ts" setup>
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from "@faker-js/faker";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useSendToPmStore } from "@/stores/send-to-pm";

defineProps({
  isMandatory: {
    type: Boolean,
    default: false,
  },
});

const colours = ref([] as any[]);
const sendToPmstore = useSendToPmStore();

const emit = defineEmits(["update"]);

function removeColour(
  colour: any = {
    id: faker.datatype.uuid(),
    name: null,
    quantity: 0,
    plateType: null,
  },
) {
  const newColours = colours.value.filter((c) => c.id !== colour.id);
  colours.value = newColours;
  emit("update", colours.value);
}

function stylify(width: number) {
  return width
    ? { minWidth: `${width}rem`, maxWidth: `${width}rem`, flex: "none" }
    : { minWidth: "auto", maxWidth: "auto", flex: "1" };
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.colours-table.edit
  border: 1px solid #ced4da
  header
    +flex-fill
    gap: $s
    h4
      margin: 0
  .actions
    +flex($h: right)

.required
  &:after
    content: "*"
    display: inline-block
    padding: 0 $s25
    color: $sgs-red
</style>
