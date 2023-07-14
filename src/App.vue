<script lang="ts" setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'primevue/usetoast'
import { computed, watch } from 'vue';

const notificationsStore = useNotificationsStore()
const toast = useToast()

const notification = computed(() => notificationsStore.notification)

watch(notification, (message: any) => {
  toast.add(message)
})
</script>

<template lang="pug">
#image-carrier
  prime-toast(:position="notification && notification.position || 'bottom-left'")
  router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

#image-carrier
  +container
</style>
