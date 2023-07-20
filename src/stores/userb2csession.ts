import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import Emitter from 'pico-emitter'

export type UserState = {
  firstName: Ref<string>
  lastName: Ref<string>
  displayName: Ref<string>
  username: Ref<string>
  email: Ref<string>
  isLoggedIn: Ref<boolean>
  userType: Ref<string>
  isValidDomain: Ref<boolean>
}

export const userB2CSessionStore = defineStore('userb2csession', () => {
  const userB2CSession = {
    username: ref(''),
    email: ref(''),
    emitter: ref(new Emitter()),
    isLoggedIn: ref(false),
    firstName: ref(''),
    lastName: ref(''),
    displayName: ref(''),
    userType: ref(''),
    isValidDomain: ref(false),
    printerId:ref(new Number()),
    printerName: ref('')
  }
  return userB2CSession
})
