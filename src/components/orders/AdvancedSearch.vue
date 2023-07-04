<template lang="pug">
form.advanced-search(@submit.prevent="onSubmit")
      button.close-button(@click.prevent="closeForm")
        i.pi.pi-times
      sgs-scrollpanel
        template(#header)
          header
            h3 Advanced Search
            p.hint(v-if="user.isExternal==false") Enter at least Printer Name, Printer Location and 1 field
            p.hint(v-if="user.isExternal==true") Enter at least Printer location and 1 field
            .error-message(v-if="showError") {{ error }}
        .form-fields(v-if="advancedFilters")
          .field-group(v-for="section in sections")
            h4(v-if="section.label") {{ section.label }}
            .f(v-for="filter in section.filters")
              label(v-if="filter.label") {{ filter.label }}
              prime-dropdown.sm(v-if="filter.type === 'printerLoc'" v-model="advancedFilters[filter.name]" name="printerLoc" :inputId="printerLoc" :options="printerLocations" appendTo="body" optionLabel="label" optionValue="value" :value="advancedFilters[filter.name]?.type || 'SEL'")
              prime-calendar(v-else-if="filter.type === 'daterange'" v-model="advancedFilters[filter.name]" :name="filter.name" :inputId="filter.name" selectionMode="range" appendTo="body")
              prime-auto-complete(v-else-if="filter.type === 'printerSuggester'" v-model="advancedFilters[filter.name]" :name="filter.name" :suggestions="printerResults" @complete="searchPrinter" :disabled="user.isExternal == true" emptyMessage="No results found"  )
              prime-auto-complete(v-else-if="filter.type === 'printerSiteSuggester'" v-model="advancedFilters[filter.name]" :name="filter.name" :suggestions="printerSiteResults" @complete="searchPrinterSites" emptyMessage="No results found" )
              prime-inputtext.sm(v-else v-model="advancedFilters[filter.name]" :name="filter.name" :id="filter.name" :disabled="filter.disabled")
        template(#footer)
          footer
            .secondaryactions
            .actions
              sgs-button.default(label="Reset" @click.prevent="reset")
              sgs-button(label="Search" type="submit")
</template>
  
  <script lang="ts" setup>
  import { ref, onBeforeMount } from "vue";
  import "primevue/resources/themes/saga-blue/theme.css";
  import "primevue/resources/primevue.min.css";
  import "primeicons/primeicons.css";
  import SuggesterService from "@/services/SuggesterService";
 
  const props = defineProps({
    sections: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      default: () => { },
    },
  });

      const user = { isExternal: false }

  interface AdvancedFilters {
  itemNumber: string | null;
  startDate: string | null;
  printerName: string | null;
  printerSite: string | null;
  printerReference: string | null;
  poNumber: string | null;
  printerPlateCode: string | null; 
  barcodeNumber: string | null;
  sgsReferenceNumberList: string | null;
    // Add more properties as needed
  }
  
  const emit = defineEmits(["search"]);
  
  const advancedFilters = ref<AdvancedFilters>();
  let printerResults: string[] | null | undefined;
  let printerSiteResults: string[] | null | undefined;
  const imageCarrierCodeTypes = ref([
    { label: "UPC Code", value: "UPC" },
    { label: "QR Code", value: "QR" },
    { label: "EAN Code", value: "EAN" },
    { label: "Data Matrix Code", value: "DATA_MATRIX" },
  ]);
  
  
  const printerLocations = ref([
    { label: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)", value: "WINPAK HEAT SEAL CORPORATION - PEKIN, IL, (430) - C00006416 - [US$] - (SGS Toronto, CA)" },
    { label: "Arizona", value: "AZ" },
    { label: "California", value: "CA" },
    { label: "Georgia", value: "GA" },
    { label: "Iowa", value: "IA" },
  ]);
  
  let printerLoc = ref("AL");
  
  const error = ref("");
  const showError = ref(false);
  
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
    advancedFilters.value.sgsReferenceNumberList= null;
    advancedFilters.value.itemNumber= null;
    advancedFilters.value.barcodeNumber= null;
    advancedFilters.value.printerName= null;
    advancedFilters.value.printerPlateCode= null;
    advancedFilters.value.poNumber= null;
    advancedFilters.value.printerSite= null;
    advancedFilters.value.printerReference= null;
    advancedFilters.value.startDate= null;
    
  }
  
  // function search() {
  //   emit("search", advancedFilters.value);
  // }

  function search(advancedSearchParameters?:any) {
    emit("search", advancedSearchParameters);
}

  async function searchPrinter(value?: any) {
      if (value.query && value.query.length > 1)
          printerResults = await SuggesterService.getPrinterList(value.query)
  }
    async function searchPrinterSites(value?: any) {console.log(value)
        if (value.query && advancedFilters.value?.printerName)
            printerSiteResults = await SuggesterService.getPrinterSiteList(advancedFilters.value?.printerName, value.query)
      }

  function onSubmit() {
    console.log(advancedFilters.value)
    const validationErrors = validateForm();
    if (validationErrors) {
      console.log(validationErrors)
      error.value = validationErrors;
      showError.value = true;
      setTimeout(() => {
        showError.value = false;
      }, 3000); // Adjust the time (in milliseconds) as needed
      return;
    }

    // Proceed with form submission or other actions
    search(advancedFilters.value)
    closeForm()
  }
  
      function validateForm() {

     if (!advancedFilters.value?.printerName) {
      return "You must select a printer.";
    }
    if (advancedFilters.value?.printerSite == null) {
      return "You must select a Shipping location.";
    }

    const errorMessage =
      "You must enter information into at least 1 field. Printer Name and Location must have an entry";
    //       const fields = Object.keys((advancedFilters.value as any)) 
    // console.log(fields)
    // for (const field  of fields) {
    //   const value = (advancedFilters.value as any)[field];
    const fields = Object.keys(advancedFilters.value);
    const additionalFields = fields.filter(
      (field) => field !== "printerName" && field !== "printerSite"
    );
    for (const field of additionalFields) {
      const value = (advancedFilters.value as any)[field];
      if (
        value != undefined &&
        value != "" &&
        value != null &&
        value?.type != "SEL"
      ) {
        return null;
      }
    }
  
    return errorMessage;
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
  
  .error-message
    margin-top: $s
    padding: $s
    background-color: rgba(255, 0, 0, 0.2)
    color: #800000
    position: relative
  
  .error-message p 
    margin: 0
  
  .error-message button.close-button 
    position: absolute
    top: 50%
    right: $s
    transform: translateY(-50%)
    background: none
    border: none
    cursor: pointer
    outline: none
  
  
  @keyframes fadeOut
    0%
      opacity: 1
    90%
      opacity: 1
    100%
      opacity: 0
  </style>
  