<script lang="ts" setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue';
import { useIdle, useCounter } from '@vueuse/core'
import { useAuthStore } from './stores/auth';
import { useB2CAuthStore } from './stores/b2cauth';


const notificationsStore = useNotificationsStore()
const toast = useToast()

const notification = computed(() => notificationsStore.notification)

const { inc, count } = useCounter()
const { idle, lastActive } = useIdle(15 * 60 * 1000) // 15 min

const authStore = useAuthStore()
const b2cAuthStore = useB2CAuthStore()
const user = authStore.currentUser
const b2cUser = b2cAuthStore.currentB2CUser
const lastUserActiveTime = ref()

watch(notification, (message: any) => {
  toast.add(message)
})

watch(idle, async (idleValue) => {
  if (idleValue) {
    // Logout ?
    inc()
    lastUserActiveTime.value = lastActive.value
    console.log(` -- ${new Date()} -  Triggered ${count.value} times - `, new Date(lastActive.value))
  } else {
    // Refresh Token
    console.log(` --  Tab is Visible${new Date()} -  User Action Detected - `, new Date(lastUserActiveTime.value))
    if(user)
      await authStore.acquireTokenSilent()
    if(b2cUser)
      await b2cAuthStore.acquireTokenSilent()
  }
})

document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    console.log(` --  Tab is hidden at ${new Date()}`)
    lastUserActiveTime.value = new Date()
  } else {

    // Refresh Token
    console.log(` --  Tab is Visible at  ${new Date()}   , User was last active on ${new Date(lastUserActiveTime.value)}`)
    await authStore.acquireTokenSilent()
  }
})
</script>

<template lang="pug">
#image-carrier
  prime-toast
  router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

#image-carrier
  +container
</style>
