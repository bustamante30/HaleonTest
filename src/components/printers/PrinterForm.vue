<!-- eslint-disable vue/attribute-hyphenation -->
<template lang="pug">
.page.details
  sgs-mask
  .container
    sgs-scrollpanel(:top="0")
      template(#header)
        header
          h1.title Add Printer
          a.close(@click="emit('close')")
            span.material-icons.outline close

      .card.summary
        .card.details
          .f
            label Printer Name
            prime-auto-complete(v-model="printerForm.name" :suggestions="printerResults" completeOnFocus=true appendTo="body" emptyMessage="No results found" :required="true" @complete="searchPrinter($event)")
          .fields
            .f
              label Identity Provider
              prime-dropdown(v-model="printerForm.provider" :options="providers" optionLabel="label" optionValue="value" placeholder="Select Provider ...")
            template(v-if="printerForm.provider !== 1")
              .f.radio(v-for="platform,i in federated" :key="i")
                prime-radiobutton.square(v-model="printerForm.federatedProvider" name="federated" :inputId="platform.value" :value="platform.value")
                label(:for="platform.value") {{ platform.label }}
          h5 Admin
          .f
            label First Name
            prime-inputtext(v-model="printerForm.adminFirstName")
          .f
            label Last Name
            prime-inputtext(v-model="printerForm.adminLastName")
          .f
            label Email
            prime-inputtext(v-model="printerForm.adminEmail")
          h5 Primary PM
          .f
            label First Name
            prime-inputtext(v-model="printerForm.primaryPMFirstName")
          .f
            label Last Name
            prime-inputtext(v-model="printerForm.primaryPMLastName")
          .f
            label Email
            prime-inputtext(v-model="printerForm.primaryPMEmail")
      template(#footer)
        footer
          .secondary-actions &nbsp;
          .actions
            sgs-button#save-printer(label="Save" @click="save()")
</template>

<script setup>
import { ref } from "vue";
import { providers, federated } from "@/data/config/identitiy-providers";
import SuggesterService from "@/services/SuggesterService";
import { useNotificationsStore } from "@/stores/notifications";
const emit = defineEmits(["save", "close"]);
const printerResults = ref([]);
const notificationsStore = useNotificationsStore();

const printerForm = ref({
  id: null,
  name: null,
  provider: 1,
  federatedProvider: null,
  adminFirstName: null,
  adminLastName: null,
  adminEmail: null,
  primaryPMFirstName: null,
  primaryPMLastName: null,
  primaryPMEmail: null,
});

async function searchPrinter(value) {
  if (value.query && value.query.length > 1) {
    printerResults.value = await SuggesterService.getPrinterList(value.query);
  }
}

function save() {
  // Required fields Validations
  if (!printerForm.value.name) {
    notificationsStore.addNotification(
      "Validation Error",
      "Printer Name is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (printerForm.value.provider === null) {
    notificationsStore.addNotification(
      "Validation Error",
      "Identify Provider is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.adminFirstName) {
    notificationsStore.addNotification(
      "Validation Error",
      "Admin FirstName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.adminLastName) {
    notificationsStore.addNotification(
      "Validation Error",
      "Admin LastName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.adminEmail) {
    notificationsStore.addNotification(
      "Validation Error",
      "Admin Email is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.primaryPMFirstName) {
    notificationsStore.addNotification(
      "Validation Error",
      "PrimaryPM FirstName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.primaryPMLastName) {
    notificationsStore.addNotification(
      "Validation Error",
      "PrimaryPM LastName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!printerForm.value.primaryPMEmail) {
    notificationsStore.addNotification(
      "Validation Error",
      "PrimaryPM Email is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }
  emit("save", printerForm);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes slide
  0%
    transform: translateX(40vw)
  100%
    transform: translate(0)

.page.details
  +container
  .container
    +fixed-e
    width: 40vw
    min-width: 30rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    +container
    z-index: 1000
    animation: slide 0.2s ease-in
  header
    +flex-fill
    background: $sgs-gray
    padding: $s50 $s
    .title
      color: white
    a.close
      opacity: 0.6
      span.material-icons
        color: white
      &:hover
        opacity: 1
  .card
    padding: $s $s2
  .card.summary
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
      padding: 0 $s
      h2, h3, h4, p
        margin-top: 0
    .f.radio
        +flex
        label
          display: inline-block
          margin: 0
          margin-left: $s50
          &:after
            content: ""

  .fields
    padding: $s 0
    margin: $s 0
    border-top: 1px solid #f2f2f2

  .f
    padding: $s50 0
    font-weight: 600
    label
      font-weight: 500
      width: 10rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block
        margin-bottom: $s25

  .f.switch
        +flex-fill
        label
          width: auto
          margin-right: $s
          &:after
            content: ''
</style>
