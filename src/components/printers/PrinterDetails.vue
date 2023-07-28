<script lang="ts" setup>
import { ref, watch } from 'vue'
import { config as userConfig } from '@/data/config/user-table'
import { config as internalUserConfig } from '@/data/config/internal-user-table'
import { config as locationConfig } from '@/data/config/location-table'

import UserTable from './UserTable.vue'
import LocationTable from './LocationTable.vue'
import PrinterProviders from './PrinterProvider.vue'
import { useUsersStore } from '@/stores/users'
import router from '@/router'

const props = defineProps({
  printer: {
    type: Object,
    default: () => {}
  },
  user: {
    type: Object,
    default: () => {}
  },
  role: {
    type: String,
    default: null
  },
  suggestions: {
    type: Array,
    default: () => []
  }
})
const usersStore = useUsersStore()

const emit = defineEmits(['createUser', 'editUser','searchUser'])

const tab = ref('users')
const parentTab = ref('MSUser')
const query = ref()

watch(query, (changeQuery) => {
  if (changeQuery === "") {
    search({ query: "" });
  }
});

function selectTab(tabName: string, parentTabName: string) {
  tab.value = tabName
  parentTab.value = parentTabName
}

function create(path: string) {
  emit('createUser')
}

function edit(user: any) {
  emit('editUser', user)
  // router.push(`/users/${user.data.id}?role=super`)
}

function search(query : any) {
  emit('searchUser', query)
}

function resend() {
  console.log('resend')
}

</script>

<template lang="pug">
sgs-scrollpanel.section.printer-details(:scroll="false")
  template(#header)
    header
      h2 {{ role && role === 'super' ? printer.name : 'Manage Users' }}
      nav.tabs
        a.tab(:class="{ selected: tab === 'users'}" @click="selectTab('users','MSUser')")
          span.f(v-if=printer && printer.summary && printer.summary.users) Users [{{ printer.summary.users }}]
        a.tab(v-if="role && role === 'super'" :class="{ selected: tab === 'internal'}" @click="selectTab('internal', 'MSUser')")
          span(v-if=printer && printer.summary) Internal Users [{{ printer.summary.internalUsers }}]
        a.tab(:class="{ selected: tab === 'locations'}" @click="selectTab('locations', 'MSUser')")
          span(v-if=printer && printer.summary) Locations [{{ printer.summary.locations }} ]
        a.tab(v-if="role && role === 'super'" :class="{ selected: tab === 'settings'}" @click="selectTab('settings','MSUser')")
          span Settings
  .toolbar(v-if="['users', 'internal'].includes(tab)")
    .actions
      .search
        .input
          prime-auto-complete.search-input(placeholder="Search Users ..." v-model="query" name="search_users" inputId="search_users" :suggestions="suggestions" @complete="search")
          span.material-icons.outline search
      sgs-button.sm(label="Add User" icon="add" @click="create")
  .content
    user-table(v-if="tab === 'users'" :data="printer.users" :config="userConfig" @editUser="edit" @resend="resend" :className="[ user ? 'lay-low' : '']")
    user-table(v-if="tab === 'internal'" :data="printer.internalUsers" :config="internalUserConfig" :className="[ user ? 'lay-low' : '']")
    location-table(v-else-if="tab === 'locations'" :data="printer.locations" :config="locationConfig")
    printer-providers(v-else-if="tab === 'settings'" :data="printer.identityProvider")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.section.printer-details
  +container

header
  +flex-fill
  background: rgba(#fff, 0.5)
  margin: $s25 0
  padding: 0 $s
  h2
    flex: 1
  nav.tabs
    a.tab
      display: inline-block
      padding: $s50 $s
      font-size: 0.9rem
      font-weight: 600
      cursor: pointer
      > span
        opacity: 0.6
        color: $sgs-black
      &:hover
        background: rgba(#fff, 0.3)
        > span
          opacity: 0.8
      &.selected
        background: #fff
        > span
          opacity: 1

.content
  +container

.toolbar
  padding: $s25 $s50
  background: #f8f9fa
  border-bottom: 1px solid #dee2e6
  .actions
    +flex($h: right)
    gap: $s50
    width: 30rem
    .search
      width: 20rem
</style>
