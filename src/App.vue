<script lang="ts" setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useIdle, useCounter } from '@vueuse/core'
import { useAuthStore } from './stores/auth';
import { useB2CAuthStore } from './stores/b2cauth';


const notificationsStore = useNotificationsStore()
const toast = useToast()

const notification = computed(() => notificationsStore.notification)

const { inc, count } = useCounter()
const { idle, lastActive } = useIdle(30 * 60 * 1000) // 30 min

const authStore = useAuthStore()
const b2cAuthStore = useB2CAuthStore()
const user = authStore.currentUser
const b2cUser = b2cAuthStore.currentB2CUser
const refreshTokenTimer = ref()
onMounted(async() =>
  {
    refreshTokenTimer.value = setInterval(
        () => refreshToken(),
        10 * 60 * 1000
      )
  }
);
onUnmounted(async() =>
{
  clearInterval(refreshTokenTimer.value)
});
watch(notification, (message: any) => {
  toast.add(message)
})

watch(idle, async (idleValue) => {
  if (idleValue) {
    console.log(` idle, logout started. `, new Date(lastActive.value))
    if(user.isLoggedIn)
      await authStore.logout()
    if(b2cUser.isLoggedIn)
      await b2cAuthStore.logout()
    inc()
  }
})

async function refreshToken() {
  if(user.isLoggedIn)
    await authStore.acquireTokenSilent()
  if(b2cUser.isLoggedIn)
    await b2cAuthStore.acquireTokenSilent()
}
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
