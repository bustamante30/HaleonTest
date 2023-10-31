import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import Emitter from "pico-emitter";

export type UserState = {
  firstName?: Ref<string>;
  lastName?: Ref<string>;
  displayName?: Ref<string>;
  username: Ref<string>;
  email?: Ref<string>;
  isLoggedIn: Ref<boolean>;
  userType: Ref<string>;
  roleKey?: Ref<string>;
  printerId: Ref<number>;
  printerName: Ref<string>;
  userId?: Ref<number>;
  identityProviderId?: Ref<number>;
  identityProviderName?: Ref<string>;
  identityTypeName?: Ref<string>;
  prtLocation: Ref<Array<string>>;
  internalUserPrinters: Ref<Array<string>>;
};

export const useUserSessionStore = defineStore("userSession", () => {
  const userSession = ref({
    username: ref(""),
    email: ref(""),
    emitter: ref(new Emitter()),
    isLoggedIn: ref(false),
    firstName: ref(""),
    lastName: ref(""),
    displayName: ref(""),
    userType: ref(""),
    printerId: ref(new Number()),
    printerName: ref(""),
    userId: ref(new Number()),
    roleKey: ref(""),
    identityProviderId: ref(new Number()),
    identityProviderName: ref(""),
    identityTypeName: ref(""),
    prtLocation: ref([]),
    internalUserPrinters: ref([]),
  });
  return { userSession };
});
