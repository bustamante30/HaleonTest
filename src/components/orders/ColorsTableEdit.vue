<script lang="ts" setup>
import { faker } from "@faker-js/faker";
import { ref, onBeforeMount, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useSendToPmStore } from "@/stores/send-to-pm";
import { useNotificationsStore } from "@/stores/notifications";

const props = defineProps({
  isMandatory: {
    type: Boolean,
    default: false,
  },
});

const colours = ref([] as any[]);
const sendToPmstore = useSendToPmStore();
const notificationsStore = useNotificationsStore();

const emit = defineEmits(["update"]);

onBeforeMount(() => {
  // addColour()
});

function addColour() {
  if (colours.value.length < 10) {
    const newColour: any = {
      id: faker.datatype.uuid(),
      name: null,
      quantity: 1,
      plateType: null,
    };
    colours.value.push(newColour);
    emit("update", colours.value);
  } else {
    notificationsStore.addNotification(
      "Add Colours Limit Exceeded",
      "Cannot add more than 10 colors",
      { severity: "error", position: "top-right" },
    );
  }
}

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

<template lang="pug">
.colours-table.edit
  data-table.p-datatable-sm(:value="colours")
    template(#header)
      header
        h4 Colours
        .actions
          sgs-button#add-color.sm.secondary(@click="addColour" icon="add" label="Add Colour")
    column()
      template(#header)
        label(:class="{ required: isMandatory }") Colour Name
      template(#body="{ data }")
        prime-inputtext.sm(v-model="data.name" @change="emit('update', colours)" placeholder="Enter color name")
    column()
      template(#header)
        label(:class="{ required: isMandatory }") Plate Type
      template(#body="{ data }")
        prime-dropdown#plate-type(v-model="data.plateType" name="plate_type" :options="sendToPmstore.imageCarrierPlateTypes" optionLabel="plateTypeName" optionValue="plateTypeName" @change="emit('update', colours)"  placeholder="Select plate type")
    column( :headerStyle="stylify(5)" :bodyStyle="stylify(5)")
      template(#header)
        label(:class="{ required: isMandatory }") Quantity
      template(#body="{ data }")
        prime-inputnumber.sm(v-model="data.quantity" showButtons buttonLayout="horizontal" :step="1" :min="1" :max="10" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" @change="emit('update', colours)")
    column(:headerStyle="stylify(2)" :bodyStyle="stylify(2)")
      template(#body="{ data }")
        .actions
          sgs-button.sm.alert.secondary(@click="removeColour(data)" icon="delete" :id="`remove-color-${data?.id}`")

</template>

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
