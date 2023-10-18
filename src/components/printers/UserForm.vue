<template lang="pug">
.page.details
  sgs-mask
  .container(v-if="user")
    sgs-scrollpanel(:top="0")
      template(#header)
        header
          h1.title(v-if="title") {{ title }}
          a.close(@click="handleClose")
            span.material-icons.outline close
      .card.summary
        .card.details
          .f
            label(for="firstname") First Name
            prime-inputtext(id="firstname" v-model="userForm.firstName" name="firstname")
          .f
            label(for="lastname") Last Name
            prime-inputtext(id="lastname" v-model="userForm.lastName" name="lastname")
          .f
            label(for="email") Email
            prime-inputtext(id="email" v-model="userForm.email" name="email")
          .f.checkbox
            // eslint-disable-next-line vue/attribute-hyphenation
            prime-checkbox.square(v-model="userForm.isAdmin" :binary="true" name="admin" inputId="admin")
            label(for="admin") Admin

          // eslint-disable-next-line vue-pug/no-parsing-error
          <div v-if="currentUserType !== 'EXT'">
            <div v-if="(userForm.userType && userForm.userType !== 'EXT') || (userForm.email && userForm.email.trim().toLowerCase().includes('@sgsco.com'))" ref="isPrimaryPMDiv">
            .f.checkbox
              prime-checkbox.square(v-model="userForm.isPrimaryPM" :binary="true" name="primaryPM" inputId="primaryPM")
              label(for="primaryPM") Is Primary PM?
            </div>
          </div>

      template(#footer)
        footer
          .secondary-actions &nbsp;
          .actions
            sgs-button#save-user(label="Save" @click="save")
</template>
<!-- eslint-disable @typescript-eslint/no-unused-vars --><!-- eslint-disable no-undef -->
<script setup>
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import router from "@/router";
import { useNotificationsStore } from "@/stores/notifications";

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
});

const userForm = ref({ ...props.user });
watch(
  () => props.user,
  () => {
    userForm.value = { ...props.user };
  },
);
const notificationsStore = useNotificationsStore();

const isPrimaryPMDiv = ref("");

const emit = defineEmits(["save"]);

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
let currentUserType = "";
if (authStore.currentUser.email != "") {
  if (
    authStore.currentUser?.userType !== undefined &&
    authStore.currentUser?.userType !== null
  ) {
    currentUserType = authStore.currentUser.userType;
  }
}

if (authb2cStore.currentB2CUser.email != "") {
  if (
    authb2cStore.currentB2CUser?.userType !== undefined &&
    authb2cStore.currentB2CUser?.userType !== null
  ) {
    currentUserType = authb2cStore.currentB2CUser.userType;
  }
}

function handleClose() {
  if (currentUserType === "INT") {
    router.push("/users?role=super");
  } else if (currentUserType === "EXT") {
    router.push("/users");
  }
}

function save() {
  //Required fields validations.
  if (!userForm.value.firstName) {
    notificationsStore.addNotification(
      "Validation Error",
      "FirstName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!userForm.value.lastName) {
    notificationsStore.addNotification(
      "Validation Error",
      "LastName is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  if (!userForm.value.email) {
    notificationsStore.addNotification(
      "Validation Error",
      "Email is required.",
      { severity: "error", position: "top-right" },
    );
    return;
  }

  emit("save", userForm);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

@keyframes slide
  0%
    transform: translateX(40vw)
  100%
    transform: translate(0)

.page.details
  +container
  .container
    +fixed-e
    width: 40vw
    min-width: 30rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    +container
    z-index: 1000
    animation: slide 0.2s ease-in
  header
    +flex-fill
    background: $sgs-gray
    padding: $s50 $s
    .title
      color: white
    a.close
      opacity: 0.6
      span.material-icons
        color: white
      &:hover
        opacity: 1
  .card
    padding: $s $s2
  .card.summary
    +flex-fill
    align-items: flex-start
    width: 100%
    position: relative
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
      width: 100%
      padding: 0 $s
      h2, h3, h4, p
        margin-top: 0

  .f
    padding: $s50 0
    font-weight: 600
    label
      font-weight: 500
      width: 10rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block
        margin-bottom: $s25

  .f.checkbox
    +flex
    margin-top: $s
    label
      display: inline-block
      margin: 0
      margin-left: $s50
      &:after
        content: ""
.w-full
  width:100%
</style>
