<script lang="ts" setup>
import { computed, ref } from 'vue'
import { providers } from '@/data/config/identitiy-providers'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ type: 'photon', settings: {} })
  }
})

let provider = ref(props.data)

const providerName = computed(() => {
  const result = providers.find((p: any) => p.value === provider.value.type)
  return result ? result.label : null
})
</script>

<template lang="pug">
.section.providers
  .identity-provider
    .fields
      .f
        label Identity Provider
        .provider(v-for="(p, i) in providers")
          prime-radiobutton.square.sm(v-model="provider.type" name="provider" :inputId="p.value" :value="p.value")
          label {{ p.label }}

  .settings
    sgs-scrollpanel.panel
      h3(v-if="providerName") Setup {{ providerName }} 
      .fields(v-if="provider && provider.type !== 1")
        .f
          label Tenant ID
          prime-inputtext.sm(v-model="provider.tenantId" :disabled="provider && provider.type === 'photon'")
        .divider
      h5 Primary Admin
      .fields(v-if="provider")
        .f
          label Name
          prime-inputtext.sm(v-model="provider.admin")
        .f
          label Email
          prime-inputtext.sm(v-model="provider.email")
      .fields.footer
        .f
          sgs-button.sm(label="Save")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.section.providers
  +container
  +flex
  background: #fff
  align-items: stretch
  .identity-provider
    width: 15rem
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
</style>
