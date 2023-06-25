<template lang="pug">
form.advanced-search(@submit.prevent="() => {}")
    button.close-button(@click.prevent="closeForm")
      i.pi.pi-times
    sgs-scrollpanel
      template(#header)
        header
          h3 Advanced Search
          p.hint Enter at least 2 fields. Printer location is a mandatory
      .form-fields(v-if="advancedFilters")
        .field-group(v-for="section in sections")
          h4(v-if="section.label") {{ section.label }}
          .f(v-for="filter in section.filters")
            label(v-if="filter.label") {{ filter.label }}
            prime-dropdown.sm(v-if="filter.type === 'printerLoc'"  v-model="advancedFilters[filter.name]" name="printerLoc" :inputId="printerLoc" :options="printerLocations" appendTo="body" optionLabel="label" optionValue="value" :value="advancedFilters[filter.name]?.type || 'SEL'")
            prime-calendar(v-else-if="filter.type === 'date'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" appendTo="body")
            prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
      template(#footer)
        footer
          .secondaryactions
          .actions
            sgs-button.default(label="Reset" @click.prevent="reset")
            sgs-button(label="Search" @click.prevent="onSubmit")
            Toast(ref="toast")
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeMount } from "vue";
import router from "@/router";
import PrimeVue from "primevue/config";
//import Dropdown from 'primevue/dropdown'
import { useToast } from "primevue/usetoast";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import type Dropdown from "primevue/dropdown"; 
import ReorderService from "@/services/ReorderService";
console.log("Testing search advance................");

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  filters: {
    type: Object,
    default: () => {},
  },
});

const toast = useToast();

interface AdvancedFilters {
  itemNumber: string | null;
  startDate: string | null;
  printerName: string | null;
  printerSite: string | null;
  packagingReference: string | null;
  poNumber: string | null;
  printerPlateCode: string | null; 
  barcodeNumber: string | null;
  // Add more properties as needed
}

const emit = defineEmits(["search"]);

const advancedFilters = ref<AdvancedFilters>();

//toRefs(ref(props.filters));

const imageCarrierCodeTypes = ref([
  { label: "UPC Code", value: "UPC" },
  { label: "QR Code", value: "QR" },
  { label: "EAN Code", value: "EAN" },
  { label: "Data Matrix Code", value: "DATA_MATRIX" },
]);


const printerLocations = ref([
    { label: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)", value: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)" },
  { label: "Arizona", value: "AZ" },
  { label: "California", value: "CL" },
  { label: "Georgia", value: "GA" },
  { label: "Iowa", value: "IA" },
]);

let printerLoc = ref("AL");

const closeForm = () => {
  const form = document.querySelector(".advanced-search") as HTMLFormElement;
  if (form) {
    form.style.display = "none";
  }
};

onBeforeMount(() => {
  advancedFilters.value = { ...(props.filters as AdvancedFilters) };
});

function reset() {
  advancedFilters.value = { ...(props.filters as AdvancedFilters) };
}

function search(advancedSearchParameters?:any) {
    emit("search", advancedSearchParameters);
}

function onSubmit() {
  //const onSubmit = handleSubmit((values) => {
  console.log("submitValues", advancedFilters.value);
  const validationErrors = validateForm();
  if (validationErrors) {
    console.log("Validation Error");
    toast.add({
      severity: "error",
      summary: "Validation Error",
      detail: validationErrors,
      life: 3000,
    });
    return;
    }
//    var advancedSearchParameters = { }
//    if (advancedFilters.value?.previousPONumber && advancedFilters.value?.previousPONumber.length>0)
//        advancedSearchParameters['poNumber'] = advancedFilters.value?.previousPONumber
//}
    search(advancedFilters.value)
    //ReorderService.getRecentReorders("", advancedSearchParameters)
  // Proceed with form submission if all validations pass
  toast.add({
    severity: "success",
    summary: "Form Submitted",
    detail: "Searching Reorders",
    life: 3000,
  });
  closeForm()
}

function validateForm() {
  if (!advancedFilters.value?.printerName) {
    return "You must select a printer.";
  }
  return null;
  
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.advanced-search
  +fixed-e
  +container
  width: 30rem
  background: white
  box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
  padding: $s
  z-index: $z-mask + 1
  background: #f6f6f6
  .form-fields
    padding: $s 0
    .field-group
      background: white
      padding: $s
      margin: 0 $s $s 0
      h4
        margin-top: 0
  .f
    padding: $s25
    > label
      display: block
      margin-bottom: $s25
    > .input
      width: 100%
    .code
      width: 10rem
  .fields
    +flex
    gap: $s
.close-button
  position: absolute
  top: $s
  right: $s
  background: none
  border: none
  cursor: pointer
  outline: none
</style>
