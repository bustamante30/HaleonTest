<script lang="ts" setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import UserForm from '@/components/printers/UserForm.vue'

const route = useRoute()
const usersStore = useUsersStore()

const id = route.params.id

const printer = computed(() => usersStore.selected)
const user = computed(() => usersStore.user)

const userName = computed(() => {
  return user.value ? `${user.value.firstName} ${user.value.lastName}`   : 'User'
})

onBeforeMount(() => {
  debugger;
 console.log("EditPage:" + id);
  usersStore.getUser(id as string)
})

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
