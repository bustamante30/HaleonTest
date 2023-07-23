<script lang="ts" setup>
import { type Ref, ref, inject, computed, onBeforeMount, reactive } from 'vue';
import SuggesterService from "@/services/SuggesterService";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import router from '@/router';
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
})

const usersStore = useUsersStore()

const printerLocResults: Ref<string[]> = ref([]);

const emit = defineEmits(['save'])

//const userForm = ref({ ...props.user })

const userForm = computed(()=>usersStore.user)

const options = inject('options') || { locations: [] }

const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
      let userType ='';
      let userRole ='';
      if(authStore.currentUser.email != '')
      {
      if (authStore.currentUser?.userType !== undefined && authStore.currentUser?.userType !== null) {
        userType =authStore.currentUser.userType;
      } 
      }
      
     if(authb2cStore.currentB2CUser.email != '')
      {
      if (authb2cStore.currentB2CUser?.userType !== undefined && authb2cStore.currentB2CUser?.userType !== null) {
        userType =authb2cStore.currentB2CUser.userType;
      }
      }

function handleClose() {
  if (userType === 'INT') {
    router.push('/users?role=super');
    usersStore.getPrinters(0)
  } else if (userType === 'EXT') {
    router.push('/users');
  }
}

function save() {
  console.log("userform:"+ userForm);
  emit('save', userForm)
}
</script>

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
            prime-inputtext(v-model="userForm.firstName" name="firstname" id="firstname")
          .f
            label(for="lastname") Last Name
            prime-inputtext(v-model="userForm.lastName" name="lastname" id="lastname")
          .f
            label(for="email") Email
            prime-inputtext(v-model="userForm.email" name="email" id="email")
          .f
            label(for="location") Location
            prime-dropdown(v-model="userForm.location" name="location" id="location" :options="options.locations" optionValue="value" optionLabel="label")
          .f.checkbox
            prime-checkbox.square(v-model="userForm.isAdmin" :binary="true" name="admin" inputId="admin")
            label(for="admin") Admin
      template(#footer)
        footer
          .secondary-actions &nbsp;
          .actions
            sgs-button(label="Save" @click="save")
</template>

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
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
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

</style>
