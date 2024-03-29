<template lang="pug">
.page.user-create
  user-form(:user="user" :title="`${printer.name}: New User`" @save="saveUser")
</template>

<!-- eslint-disable no-undef -->
<script setup>
import { useUsersStore } from "@/stores/users";
import UserForm from "@/components/printers/UserForm.vue";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import router from "@/router";
import { useNotificationsStore } from "@/stores/notifications";
import * as Constants from "@/services/Constants";

const usersStore = useUsersStore();
const notificationsStore = useNotificationsStore();

const printer = computed(() => usersStore.selected);
const user = computed(() => usersStore.user);
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

onMounted(() => {
  usersStore.createUser();
});

async function saveUser(userRequest) {
  let userType = "";
  let printerId = "";
  if (authStore.currentUser.email != "") {
    if (
      authStore.currentUser?.userType !== undefined &&
      authStore.currentUser?.userType !== null
    ) {
      userType = authStore.currentUser.userType;
    }
  }

  if (authb2cStore.currentB2CUser.email != "") {
    if (
      authb2cStore.currentB2CUser?.userType !== undefined &&
      authb2cStore.currentB2CUser?.userType !== null
    ) {
      userType = authb2cStore.currentB2CUser.userType;
    }
  }

  if (userType === "EXT") {
    if (
      authb2cStore.currentB2CUser?.printerId !== undefined &&
      authb2cStore.currentB2CUser?.printerId !== null
    ) {
      printerId = authb2cStore.currentB2CUser.printerId;
    }
  } else if (userType === "INT") {
    printerId = usersStore.selected.id;
  }

  const userResp = await usersStore.saveUser(userRequest);
  if (userResp.title === undefined) {
    notificationsStore.addNotification(
      Constants.USER_CREATION,
      Constants.USER_CREATION_SUCCESS,
      { severity: "Success", position: "top-right" },
    );
  } else {
    notificationsStore.addNotification(Constants.FAILURE, userResp.detail, {
      severity: "error",
      life: 5000,
    });
  }
  await usersStore.getPrinters(0, 500, "", "", printerId);
  if (userType === "INT") {
    router.push("/users?role=super");
  } else if (userType === "EXT") {
    router.push("/users");
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.page.user-create
  +container
  +fixed
</style>
