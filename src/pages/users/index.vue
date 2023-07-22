<script lang="ts" setup>
import { onBeforeMount, computed, ref, watch, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import PrinterList from '@/components/printers/PrinterList.vue'
import PrinterDetails from '@/components/printers/PrinterDetails.vue'

import { useUsersStore } from '@/stores/users'
import { useAuthStore } from "@/stores/auth"
import { useB2CAuthStore } from "@/stores/b2cauth"

const route = useRoute()
let role = ref(route.query?.role)

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const usersStore = useUsersStore()
const printers = computed(() => usersStore.printers as any)
const selected = computed(() => usersStore.selected)
const user = computed(() => usersStore.user)
const options = computed(() => usersStore.options)

provide('options', options)

onMounted(() => {
  usersStore.getPrinters(0)
  usersStore.getPrinterById('')
})

watch(() => route.query, (query) => {
  console.log(route.query?.role)
  role.value = query?.role
})

function selectPrinter(printer: any) {
  usersStore.getPrinterById(printer)
}

function getPrinters(event: any) {
  const page = event ? event / 20 : 0
  console.log(event, page)
  // const perPage = (printers && printers.value ? printers.value.perPage : 20)
  usersStore.getPrinters(page)
}

function createUser() {
  usersStore.createUser()
}

function editUser(user: any) {
  usersStore.editUser(user)
}
</script>

<template lang="pug">
.page.users
  sgs-scrollpanel(:scroll="false")
    template(#header)
      app-header
    sgs-scrollpanel(:scroll="false")
      template(v-if="role && role === 'super'" #header)
        header.page-title
          h1 Manage Users
      main(:class="{ super: role && role === 'super' }")
        .printers(v-if="role && role === 'super'")
          printer-list(:printers="printers" :selected="selected" @select="selectPrinter" @fetch="getPrinters")
        .users-content
          sgs-scrollpanel(v-if="selected")
            printer-details(:printer="selected" @createUser="createUser" @editUser="editUser" :user="user" :role="role")
  router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.page.users
  +container
  header.page-title
    padding: $s50 $s
  main
    +flex-fill
    +container
    &:not(.super)
      margin-top: $s
    .printers
      width: 25rem
      +container
      padding-left: $s
    .users-content
      +container
      padding: 0 $s $s50 $s
      flex: 1
      header
        +flex-fill
        h1
          flex: 1

.actions
  +flex($h: right)
  gap: $s
</style>
