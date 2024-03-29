<!-- eslint-disable vue/no-v-model-argument -->
<template lang="pug">
#image-carrier
  sgs-scrollpanel(:scroll="false")
    template(#header)
      app-header(v-if="!isLoginPage && !isB2CLoginPage && !isError" @demo="handleDemo" @report="handleReport" @faq="handleFaq")
    prime-toast(@close="notificationsStore.removeNotification()")
      template(#message="{ message }")
        .message
          h4 {{ message.summary }}
          // eslint-disable-next-line vue/no-v-html
          .detail(v-html="message.detail") 
          router-link(v-if="message?.link && message.link !== ''" :to="message.link") {{message.linkLabel}}
    prime-toast.multiple(:position="notification && notification.position || 'bottom-left'" group="multiple" @close="notificationsStore.removeNotification()")
      template(#message="{ message }")
        .message
          h4 {{ message.summary }}
          // eslint-disable-next-line vue/no-v-html
          .detail(v-html="message.detail") 
    router-view
  prime-dialog.demo(v-model:visible='isDemoVisible' closable='closable' modal='modal' :style="{ width: '98vw', height: '98vh' }")
    template(#header='')
      header.videoheader
        sgs-button#chapters.sm(v-if='chapters && chapters.length' :label='`Chapters [${chapters.length}]`' :class='{ secondary: !showChapters, primary: showChapters }' @click='showChapters = !showChapters')
    demo-video(:chapters='chapters' :showchapters='showChapters')
  prime-dialog.issue(v-model:visible="isReportFormVisible" closable modal :style="{ width: '45rem', overflow: 'hidden' }")
    template(#header)
      header
        h4 Report an Issue - Image Carrier Reorder
    report-issue(@close="isReportFormVisible = false")

</template>

<script lang="ts" setup>
import { useNotificationsStore } from "@/stores/notifications";
import { useToast } from "primevue/usetoast";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useIdle, useCounter } from "@vueuse/core";
import { useAuthStore } from "./stores/auth";
import { useB2CAuthStore } from "./stores/b2cauth";
import AppHeader from "@/components/common/AppHeader.vue";
import DemoVideo from "./components/common/DemoVideo.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import csvFile from "./components/common/videos/demo.csv";
import ReportIssue from "./components/common/ReportIssue.vue";
import { useRouter, useRoute } from "vue-router";
import { useLoggerStore } from "./stores/uilogger";

const route = useRoute();
const notificationsStore = useNotificationsStore();
const toast = useToast();
const router = useRouter();
const notification = computed(() => notificationsStore.notification);
const { inc } = useCounter();
const { idle, lastActive } = useIdle(30 * 60 * 1000); // 30 min

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const isLoginPage = computed(() => {
  return router?.currentRoute?.value?.path === "/";
});
const isB2CLoginPage = computed(() => {
  var encodedStr = route.query["useremail"];
  var decodedStr = "";
  if (typeof encodedStr != "undefined" && encodedStr != null) {
    decodedStr = atob("" + encodedStr);
  }
  authb2cStore.setUseremail(decodedStr);
  return router?.currentRoute?.value?.path === "/b2clogin";
});
const isError = computed(() => {
  return router?.currentRoute?.value?.path === "/error";
});
const refreshTokenTimer = ref();
let isReportFormVisible = ref(false);
const loggerStore = useLoggerStore();
onMounted(async () => {
  loggerStore.init();
  refreshTokenTimer.value = setInterval(() => refreshToken(), 10 * 60 * 1000);
});
onUnmounted(async () => {
  clearInterval(refreshTokenTimer.value);
});

let chapters = ref(csvFile);
let isDemoVisible = ref(false);
let showChapters = ref(false);

watch(notification, (notification) => {
  if (notification) {
    toast.add(notification);
    if (notification.life)
      notification.group
        ? setTimeout(
            () => toast.removeGroup(notification.group),
            notification.life,
          )
        : setTimeout(() => toast.removeAllGroups(), notification.life);
  } else toast.removeAllGroups();
});

watch(idle, async (idleValue) => {
  if (idleValue) {
    console.log(` idle, logout started. `, new Date(lastActive.value));
    if (isUserLoggedIn.value) await authStore.logout();
    if (isb2cUserLoggedIn.value) await authb2cStore.logout();
    inc();
  }
});

async function refreshToken() {
  if (isUserLoggedIn.value) await authStore.acquireTokenSilent();
  if (isb2cUserLoggedIn.value) await authb2cStore.acquireTokenSilent();
}

async function handleDemo() {
  isDemoVisible.value = true;
}

async function handleReport() {
  if (authb2cStore.currentB2CUser.email != "") {
    if (
      authb2cStore.currentB2CUser?.userType !== undefined &&
      authb2cStore.currentB2CUser?.userType !== null &&
      authb2cStore.currentB2CUser?.userType != ""
    ) {
      isReportFormVisible.value = true;
    }
  } else {
    if (
      authStore.currentUser?.userType !== undefined &&
      authStore.currentUser?.userType !== null &&
      authStore.currentUser?.userType != ""
    ) {
      window.open(
        import.meta.env.VITE_SERVICE_NOW_INTERNAL_URL,
        "_blank",
        "noreferrer",
      );
    }
  }
}

async function handleFaq() {
  router.push("/faq");
}
</script>

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
