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
}

export const userSessionStore = defineStore('usersession', () => {
  const userSession = {
    username: ref(''),
    email: ref(''),
    emitter: ref(new Emitter()),
    isLoggedIn: ref(false),
    firstName: ref(''),
    lastName: ref(''),
    displayName: ref(''),
    userType: ref(''),
    printerId:ref(new Number()),
    printerName: ref('')
  }
  return userSession
})
