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
  await usersStore.saveUser(value)
  await usersStore.getPrinters(0,500,'','',usersStore.selected.id)
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
