<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import UserForm from '@/components/printers/UserForm.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";

const route = useRoute()
const usersStore = useUsersStore()

const id = route.params.id

const printer = computed(() => usersStore.selected)
const user = computed(() => usersStore.user)

const userName = computed(() => {
  return user.value ? `${user.value.firstName} ${user.value.lastName}`   : 'User'
})

onBeforeMount(() => {
  usersStore.getUser(id)
})

async function saveUser(value) {
  let userType ='';
  let printerId = "";
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
      
  await usersStore.saveUser(value)
  await usersStore.getPrinters(0,500,'','',printerId)
}

</script>

<template lang="pug">
.page.user-edit
  user-form(:user="user" :title="`${printer.name}: Edit ${userName}`" @save="saveUser")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.page.user-edit
  +container
  +fixed
</style>
