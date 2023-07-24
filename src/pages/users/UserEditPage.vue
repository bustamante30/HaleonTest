<script lang="ts" setup>
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
 console.log("EditPage:" + id);
  usersStore.getUser(id as string)
})

const authStore = useAuthStore();
  const authb2cStore = useB2CAuthStore();
  let userType = '';
  let userRole = '';

  if (authStore.currentUser.email !== '') {
    if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
      userType = authStore.currentUser.userType;
      userRole = authStore.currentUser.roleKey;
    }
  }

  if (authb2cStore.currentB2CUser.email !== '') {
    if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
      userType = authb2cStore.currentB2CUser.userType;
      userRole = authb2cStore.currentB2CUser.roleKey;
    }
  }



function saveUser(value: any) {
  usersStore.saveUser(value)
  usersStore.getPrinters(0)
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
