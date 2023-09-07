<script lang="ts" setup>
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useIdle, useCounter } from '@vueuse/core'
import { useAuthStore } from './stores/auth';
import { useB2CAuthStore } from './stores/b2cauth';
import AppHeader from '@/components/common/AppHeader.vue'
import DemoVideo from './components/common/DemoVideo.vue'
//@ts-ignore
import csvFile from './components/common/videos/demo.csv'
import ReportIssue from './components/common/ReportIssue.vue'
import { useRouter } from "vue-router";

const notificationsStore = useNotificationsStore()
const toast = useToast()
const router = useRouter()

const messages = computed(() => notificationsStore.messages)
const notification = computed(() => notificationsStore.notification)

const { inc, count } = useCounter()
const { idle, lastActive } = useIdle(30 * 60 * 1000) // 30 min

const authStore = useAuthStore()
const authb2cStore = useB2CAuthStore()
const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const isLoginPage = computed(() => {
  console.log(router?.currentRoute?.value?.path)
  return ((router?.currentRoute as any)?.value?.path) === '/'
});
const isB2CLoginPage = computed(() => {
  return ((router?.currentRoute as any)?.value?.path) === '/b2clogin'
});
const isError = computed(() => {
  return ((router?.currentRoute as any)?.value?.path) === '/error'
});
const refreshTokenTimer = ref()
let isReportFormVisible = ref(false)
onMounted(async () => {
  refreshTokenTimer.value = setInterval(
    () => refreshToken(),
    10 * 60 * 1000
  )
}
);
onUnmounted(async () => {
  clearInterval(refreshTokenTimer.value)
});

let chapters = ref(csvFile)
let isDemoVisible = ref(false)
let showChapters = ref(false)

watch(notification, (message: any) => {
  toast.add(message)
})

watch(idle, async (idleValue) => {
  if (idleValue) {
    console.log(` idle, logout started. `, new Date(lastActive.value))
    if (isUserLoggedIn.value)
      await authStore.logout()
    if (isb2cUserLoggedIn.value)
      await authb2cStore.logout()
    inc()
  }
})

async function refreshToken() {
  if (isUserLoggedIn.value)
    await authStore.acquireTokenSilent()
  if (isb2cUserLoggedIn.value)
    await authb2cStore.acquireTokenSilent()
}

async function handleDemo() {
  isDemoVisible.value = true
}

async function handleReport() {
  if (authb2cStore.currentB2CUser.email != "") {
    if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null && authb2cStore.currentB2CUser?.userType != "") {
      isReportFormVisible.value = true
    }
  } else {
    if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null && authStore.currentUser?.userType != "") {
      window.open(import.meta.env.VITE_SERVICE_NOW_INTERNAL_URL, '_blank', 'noreferrer');
    }
  }
}
</script>

<template lang="pug">
#image-carrier
  sgs-scrollpanel(:scroll="false")
    template(#header)
      app-header(v-if="!isLoginPage && !isB2CLoginPage && !isError" @demo="handleDemo" @report="handleReport")
    prime-toast
    router-view
  prime-dialog.demo(v-model:visible='isDemoVisible' closable='closable' modal='modal' :style="{ width: '98vw', height: '98vh' }")
    template(#header='')
      header.videoheader
        sgs-button.sm(v-if='chapters && chapters.length' @click='showChapters = !showChapters' :label='`Chapters [${chapters.length}]`' :class='{ secondary: !showChapters, primary: showChapters }')
    demo-video(:chapters='chapters' :showchapters='showChapters')
  prime-dialog.issue(v-model:visible="isReportFormVisible" closable modal :style="{ width: '45rem', overflow: 'hidden' }")
    template(#header)
      header
        h4 Report an Issue - Image Carrier Reorder
    report-issue(@close="isReportFormVisible = false")

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

#image-carrier
  +container

.demo
  header
    padding: $s25
    +flex
    button
      margin-left: $s

</style>
