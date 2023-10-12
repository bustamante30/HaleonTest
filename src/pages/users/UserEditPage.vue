<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useUsersStore } from "@/stores/users";
import UserForm from "@/components/printers/UserForm.vue";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from "@/stores/notifications";
import router from "@/router";

const route = useRoute();
const usersStore = useUsersStore();
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const notificationsStore = useNotificationsStore();

const id = route.params.id;

const printer = computed(() => usersStore.selected);
const user = computed(() => usersStore.user);

const userName = computed(() => {
  return user.value ? `${user.value.firstName} ${user.value.lastName}` : "User";
});

onBeforeMount(() => {
  usersStore.getUser(id);
});

async function saveUser(value) {
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

  const userEditResp = await usersStore.saveUser(value);

  if (userEditResp) {
    notificationsStore.addNotification(
      `User Update`,
      `User Updated Successfully`,
      { severity: "Success", position: "top-right" },
    );
    await usersStore.getPrinters(0, 500, "", "", printerId);

    if (userType === "EXT") {
      router.push("/users");
    } else if (userType === "INT") {
      router.push("/users?role=super");
    }
  }
}

const showSuccess = (summary, severity) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: "Message Content",
    life: 3000,
  });
};
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
