<script lang="ts" setup>
import { computed, ref } from 'vue'
import { providers, federated } from '@/data/config/identitiy-providers'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ type: 'photon', settings: {} })
  }
})

const usersStore = useUsersStore()
const identityProviderId  = computed(() => usersStore.identityProviderId);
const identityTypeId = computed(() => usersStore.identityTypeId);
let provider = ref({
  identityProviderId : 2,
  identityTypeId : 3

})

// const providerName = computed(() => {
//   const result = providers.find((p: any) => p.value === provider.value)
//   console.log("providers:" + providers)
//   return result ? result.label : null
// })

</script>

<template lang="pug">
.section.providers
  .identity-provider
    .fields
      .f
        h2.m-b-15.flex-center Identity Provider
        .providers.m-b-15.flex-center
          .provider(v-for="(p, i) in providers")
            prime-radiobutton.square.sm(v-model="identityProviderId" name="provider" :inputId="p.value" :value="p.value")
            label {{ p.label }}
      .federateds.m-b-15.flex-center(v-if="identityProviderId !== 1")
        .f.radio(v-for="platform in federated")
          prime-radiobutton.square(v-model="identityTypeId" name="federated" :inputId="platform.value" :value="platform.value")
          label(:for="platform.value") {{ platform.label }}
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.section.providers
  +container
  +flex
  background: #fff
  align-items: stretch
  .identity-provider
    width: 100%
    display: flex
    padding: 1rem
    justify-content: center
    padding: $s
  .settings
    flex: 1
    border-left: 1px solid rgba($sgs-gray, 0.2)
    padding: $s $s2
    .fields
      max-width: 30rem
  .fields
    .f
      padding: $s25 0
      label
        display: inline-block
        font-size: 0.9rem
        margin-bottom: $s50
      .provider
        +flex
        padding: $s25 0
        label
          font-size: 1rem
          margin: 0
          margin-left: $s50
  .footer
    padding-top: $s
    +flex($h: right)

.providers
  +flex
  gap:1rem

.f.radio
  +flex
  align-items: baseline
  label
    display: inline-block
    margin: 0
    margin-left: $s50
    &:after
      content: ""
.federateds
  +flex
  gap: 1rem
.m-b-15
  margin-bottom: 15px
.flex-center
  display: flex
  justify-content: center
</style>
