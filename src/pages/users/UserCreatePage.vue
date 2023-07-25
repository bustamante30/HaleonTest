<script setup>
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import UserForm from '@/components/printers/UserForm.vue'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import router from '@/router';


const route = useRoute()
const usersStore = useUsersStore()

const id = route.params.id
const printer = computed(() => usersStore.selected)
const user = computed(() => usersStore.user)
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

onMounted(() => {
  usersStore.createUser()
})


      let userType ='';
      let userRole ='';
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

async function saveUser(userRequest) {
 await usersStore.saveUser(userRequest)
 await usersStore.getPrinters(0)
 if (userType === 'INT') {
    router.push('/users?role=super');
  } else if (userType === 'EXT') {
    router.push('/users');
  }
}

</script>

<template lang="pug">
.page.user-create
  user-form(:user="user" :title="`${printer.name}: New User`" @save="saveUser")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.page.user-create
  +container
  +fixed
</style>
