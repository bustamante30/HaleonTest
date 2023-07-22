<script lang="ts" setup>
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import UserForm from '@/components/printers/UserForm.vue'

const route = useRoute()
const usersStore = useUsersStore()



const id = route.params.id

const printer = computed(() => usersStore.selected)
const user = computed(() => usersStore.user)

onMounted(() => {
  usersStore.createUser()
})

function saveUser(userRequest: any) {
  usersStore.saveUser(userRequest)
  usersStore.getPrinters(0)
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
