<template lang="pug">
form.advanced-search(@submit.prevent="() => {}")
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
            prime-dropdown.sm(v-if="filter.type === 'printerLoc'" v-model="advancedFilters[filter.name].type" name="printerLoc" :inputId="printerLoc"  :options="printerLocations" appendTo="body" optionLabel="label" optionValue="value" :class="['w-full md:w-14rem', { 'p-invalid': errorMessage }]" aria-describedby='dd-error')
            prime-calendar(v-else-if="filter.type === 'daterange'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" selectionMode="range" appendTo="body")
            .fields(v-else-if="filter.type === 'imageCarrierCodeType'")
              prime-dropdown.code(v-if="advancedFilters[filter.name]" v-model="advancedFilters[filter.name].type" name="imageCarrierCodeType" :inputId="imageCarrierCodeType" :options="imageCarrierCodeTypes" appendTo="body" optionLabel="label" optionValue="value")
              prime-inputtext.sm(v-if="advancedFilters[filter.name]" v-model="advancedFilters[filter.name].code")
            prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
      template(#footer)
        footer
          .secondaryactions
          .actions
            sgs-button.default(label="Reset" @click.prevent="reset")
            sgs-button(label="Search" @click.prevent="onSubmit")
            small#dd-error.p-error {{ errorMessage || &apos;&nbsp;&apos; }}
            Toast(ref="toast")
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeMount, onMounted} from 'vue'
import router from '@/router'
import PrimeVue from 'primevue/config'
import Dropdown from 'primevue/dropdown'
import { useField, useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => {}
  }
})

// const { handleSubmit, resetForm } = useForm();
// const { value, errorMessage } = useField('value', validateField);
// const toast = useToast();

const { handleSubmit, resetForm } = useForm();
const { value: printerName, errorMessage: printerNameError } = useField('printerName', validatePrinterName);
 const { value: printerLocation, errorMessage: printerLocationError } = useField('printerLocation', validatePrinterLocation);
 const toast = useToast();

const emit = defineEmits(['search'])

const advancedFilters = ref()

const imageCarrierCodeTypes = ref([
  { label: 'UPC Code', value: 'UPC' },
  { label: 'QR Code', value: 'QR' },
  { label: 'EAN Code', value: 'EAN' },
  { label: 'Data Matrix Code', value: 'DATA_MATRIX' },
])

let imageCarrierCodeType = ref('UPC')

const printerLocations = ref([
    { label: 'SELECT', value: 'SEL' },
    { label: 'Alabama', value: 'AL' },
    { label: 'Arizona', value: 'AZ' },
    { label: 'California', value: 'CL' },
    { label: 'Georgia', value: 'GA' },
  ])
  
  let printerLoc = ref('SEL')

onBeforeMount(() => {
  advancedFilters.value = { ...props.filters }
})

function reset() {
  printerLoc.value = 'SEL';
  advancedFilters.value = { ...props.filters }
}

function search() {
  emit('search', advancedFilters.value)
}

// function validateField(value) {
//     console.log('validateField', value)
//     if (!value) {
//         return 'You must select a printer location.';
//     }

//     return true;
// }
// const onSubmit = handleSubmit((values) => {
//   console.log('TEM')
// })

function onSubmit() {
    if (!validateForm()) {
      console.log("Validation Error")
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'You must enter information into at least 1 field. Printer Name and Location must have an entry',
      });
      return;
    }

    // Proceed with form submission if all validations pass
    // ...

    toast.add({
      severity: 'success',
      summary: 'Form Submitted',
      detail: 'Searching Reorders',
    });
  }

function validateForm() {
  if (!printerName.value || !printerLocation.value) {
    console.log("printerNameVal", printerName.value)
    console.log("printerLocationVal", printerLocation.value)
    return false;
  }

  const fields = Object.keys(advancedFilters.value);
  const additionalFields = fields.filter((field) => field !== 'printerName' && field !== 'printerLocation');
console.log("additionalFields",additionalFields)
  for (const field of additionalFields) {
    const value = advancedFilters.value[field];
    if (value && value.trim() !== '') {
      console.log("additionalfieldsvalue", value)
      return true;
    }
  }

  return false;
}

function validatePrinterName(value) {
  console.log("printer:", value)
  if (!value || value.trim() === '') {
    console.log("printer:", value)
    return 'You must select a printer';
  }

  return true;
}

  function validatePrinterLocation(value) {
    console.log("printerLoc:", value);
  if (!value || value === 'SEL') {
    return 'You must select a printer location.';
  }

  return true;
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

</style>
