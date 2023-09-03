<script setup>
import { onBeforeMount, computed, ref, watch, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import PrinterList from '@/components/printers/PrinterList.vue'
import PrinterDetails from '@/components/printers/PrinterDetails.vue'
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from '@/stores/notifications';

const authStore =  useAuthStore();
const authb2cStore = useB2CAuthStore();
const usersStore = useUsersStore();
const notificationsStore = useNotificationsStore();

const route = useRoute();
let role = ref(route.query?.role);


const printers = computed(() => usersStore.printers);
const selected = computed(() => usersStore.selected);
const user = computed(() => usersStore.user);
const options = computed(() => usersStore.options);
let printerId = "";
let userType ="";

provide('options', options)

onMounted(() => {
  usersStore.getPrinters(0)
  usersStore.getPrinterById('')
})

watch(() => route.query, (query) => {
  role.value = query?.role
})

async function selectPrinter(printer) {
  await usersStore.getPrinterById(printer)
}

 async function getPrinters(event) {
  const page = event ? event / 20 : 0
  // const perPage = (printers && printers.value ? printers.value.perPage : 20)
   await usersStore.getPrinters(page)
}

function createUser() {
  usersStore.createUser()
}

function editUser(user) {
 usersStore.getUser(user.data.id)
}

 function searchUser(query) {
   //getting printerId value
      if(authStore.currentUser.email != '')
      {
        if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
          userType =authStore.currentUser.userType;
        } 
      }
      
     if(authb2cStore.currentB2CUser.email != '')
     {
        if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
          userType =authb2cStore.currentB2CUser.userType;
        }
      }
      
      if( userType === "EXT")
      {
        if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
          printerId = authb2cStore.currentB2CUser.printerId;
        }

      }
      else if(userType === "INT")
      {
        printerId = usersStore.selected.id;
      }

      //check search key
      if(query.query != "")
      {
        usersStore.getPrinterById(printerId,query.query)
      }
      else
      {
        usersStore.getPrinterById(printerId,'')
      }
}

async function searchPrinter(query) {
      if(query.query != "")
      {
        usersStore.getPrinters(0,500,"",query.query)
      }
      else
      {
        usersStore.getPrinters(0)
        usersStore.getPrinterById('')
      }
}

async function deleteUser(user) {
  if(authStore.currentUser.email != '')
      {
        if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
          userType =authStore.currentUser.userType;
        } 
      }
      
     if(authb2cStore.currentB2CUser.email != '')
     {
        if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
          userType =authb2cStore.currentB2CUser.userType;
        }
      }
      
      if( userType === "EXT")
      {
        if (authb2cStore.currentB2CUser?.printerId !== undefined && authb2cStore.currentB2CUser?.printerId !== null) {
          printerId = authb2cStore.currentB2CUser.printerId;
        }

      }
      else if(userType === "INT")
      {
        printerId = usersStore.selected.id;
      }

 await usersStore.deleteUser(user.data.id)
 notificationsStore.addNotification(
        `User Deletion`,
        `User Deleted Successfully`,
        { severity: 'Success', position: 'top-right' }
      );
 await usersStore.getPrinters(0,500,'','',usersStore.selected.id)
}

function resend(user) {
 usersStore.resendInvitation(user.data.id)
 notificationsStore.addNotification(
        `Resend Invitation`,
        `Invitation resend Successfully`,
        { severity: 'Success', position: 'top-right' }
      );
}

</script>
<template lang="pug">
.page.users
  sgs-scrollpanel(:scroll="false")
    template(v-if="role && role === 'super'" #header)
      header.page-title
        h1 Manage Users
    main(:class="{ super: role && role === 'super' }")
      .printers(v-if="role && role === 'super'")
        printer-list(:printers="printers" :selected="selected" @select="selectPrinter" @fetch="getPrinters" @searchPrinter="searchPrinter")
      .users-content
        sgs-scrollpanel(v-if="selected")
          printer-details(:printer="selected" @createUser="createUser" @editUser="editUser" @deleteUser="deleteUser" @resend="resend" :user="user" :role="role" @searchUser ="searchUser")
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
