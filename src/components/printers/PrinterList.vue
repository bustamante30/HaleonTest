<script setup>
import { faker } from '@faker-js/faker'
import { ref, onBeforeMount } from 'vue'
import PrinterForm from './PrinterForm.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useUsersStore } from '@/stores/users';
import router from '@/router';

const props = defineProps({
  printers  : {
    type: Object,
    default: () => {
      return {
        page: 0,
        perPage: 20,
        total: 0,
        data: []
      }
    }
  },
  selected: {
    type: Object,
    default: null
  },
  suggestions: {
    type: Array,
    default: () => []
  }
})

const usersStore = useUsersStore()
const emit = defineEmits(['select', 'fetch', 'searchPrinter'])

let isPrinterFormVisible = ref(false)
const query = ref()

function selectPrinter(printer) {
  emit('select', printer)
}

function getPrinters(event) {
  emit('fetch', event)

}

function searchPrinter(query) {
  emit('searchPrinter', query)
}


async function saveprinter(printerFormRequest) {
  await  usersStore.savePrinter(printerFormRequest);
  await usersStore.getPrinters(0)
  isPrinterFormVisible.value = false;
  router.push('/users?role=super');
}


</script>

<template lang="pug">
.list(v-if="printers && printers.data")
  sgs-scrollpanel.printers
    template(#header)
      header
        .search
          .input
            prime-auto-complete.search-input(placeholder="Search Printers ..." v-model="query" name="search_printers" inputId="search_printers" :suggestions="suggestions" @complete="searchPrinter")
            span.material-icons.outline search
        sgs-button.sm(label="Add Printer" icon="add" @click="isPrinterFormVisible = true")
    .printer(v-for="(printer, i) in printers.data" :class="{ selected: selected && (printer.id === selected.id) }" @click="selectPrinter(printer.id)")
      span {{ printer.name }}
      span.summary
        small.users {{ printer.summary.admins }} Users
        small.locations {{ printer.summary.locations }} Locations
        small.identity-provider {{ printer.summary.identityProvider }}
    template(#footer)
      prime-paginator(
        :totalRecords="printers.total"
        :rows="printers.perPage"
        :pageLinkSize="3"
        @update:first="getPrinters"
        template="PrevPageLink CurrentPageReport NextPageLink")

  printer-form(v-if="isPrinterFormVisible" @save="saveprinter"  @close="isPrinterFormVisible = false")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.list
  +container
  padding: 0 0 $s50
  .printers
    background: #fff
  .printer
    padding: $s50 $s
    border-bottom: 1px solid rgba($sgs-gray, 0.1)
    font-size: 0.9rem
    font-weight: 600
    position: relative
    cursor: pointer
    &:hover
      background-color: rgba($sgs-blue, 0.075)
      .summary
        opacity: 1
    &.selected
      background-color: rgba($sgs-blue, 0.15)

span.summary
  +flex
  opacity: 0.8
  gap: $s25
  padding: $s25 0
  > *
    display: inline-block
    background: lighten($sgs-black, 80%)
    padding: $s125 $s25 $s125

header
  +flex-fill
  gap: $s50
  padding: $s50
  background: rgba($sgs-gray, 0.2)

// .search
//   +flex
//   flex: 1
//   .input
//     flex: 1
//     position: relative
//     span.material-icons
//       +absolute-w
//       +flex(center, center)
//       left: $s50
//       font-size: 1.5rem
//       opacity: 0.6
</style>
