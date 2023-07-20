<script setup>
import { ref } from 'vue'
import router from '@/router'
import { providers } from '@/data/config/identitiy-providers'

const emit = defineEmits(['save', 'close'])

const printerForm = ref({
  name: null,
  provider: null,
  tenantId: null,
  admin: null,
  email: null,
})

function save() {
  emit('save', printerForm.value)
}
</script>

<template lang="pug">
.page.details
  sgs-mask
  .container
    sgs-scrollpanel(:top="0")
      template(#header)
        header
          h1.title Add Printer
          a.close(@click="emit('close')")
            span.material-icons.outline close

      .card.summary
        .card.details
          .f
            label Printer Name
            prime-auto-complete(v-model="printerForm.name")
          .f
            label Identify Provider
            prime-dropdown(v-model="printerForm.provider" :options="providers" optionLabel="label" optionValue="value")
          .f(v-if="printerForm.provider !== 'photon'")
            label Tenant ID
            prime-inputtext(v-model="printerForm.tenantId")
          h5 Admin
          .f
            label Name
            prime-inputtext(v-model="printerForm.admin")
          .f
            label Email
            prime-inputtext(v-model="printerForm.email")
      template(#footer)
        footer
          .secondary-actions &nbsp;
          .actions
            sgs-button(label="Save" @click="save()")
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
    label
      display: inline-block
      margin: 0
      margin-left: $s50
      &:after
        content: ""

</style>