import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import Emitter from "pico-emitter";

export type UserState = {
  firstName: Ref<string>;
  lastName: Ref<string>;
  displayName: Ref<string>;
  username: Ref<string>;
  email: Ref<string>;
  isLoggedIn: Ref<boolean>;
  userType: Ref<string>;
  roleKey: Ref<string>;
  isValidDomain: Ref<boolean>;
  userId: Ref<number>;
  printerId: Ref<number>;
  printerName: Ref<string>;
  identityProviderId: Ref<number>;
  identityProviderName: Ref<string>;
  identityTypeName: Ref<string>;
  prtLocation: Ref<Array<string>>;
};

export const userB2CSessionStore = defineStore("userb2csession", () => {
  const userB2CSession = ref({
    username: ref(""),
    email: ref(""),
    emitter: ref(new Emitter()),
    isLoggedIn: ref(false),
    firstName: ref(""),
    lastName: ref(""),
    displayName: ref(""),
    userType: ref(""),
    isValidDomain: ref(false),
    printerId: ref(new Number()),
    printerName: ref(""),
    userId: ref(new Number()),
    roleKey: ref(""),
    identityProviderId: ref(new Number()),
    identityProviderName: ref(""),
    identityTypeName: ref(""),
    prtLocation: ref([]),
    printerUserIds: [] as number[],
  });
  return { userB2CSession };
});
