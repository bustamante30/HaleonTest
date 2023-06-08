<script lang="ts" setup>
import { onBeforeMount, ref, watch } from 'vue';

const props = defineProps({
  checkout: {
    type: Object,
    default: {
      expectedDate: null,
      purchaseOrder: null,
      shippingAddrress: null
    }
  }
})

const emit = defineEmits(['change'])

const checkoutForm = ref()

onBeforeMount(() => {
  checkoutForm.value = { ...props.checkout }
})

watch(props.checkout, () => {
  checkoutForm.value = { ...props.checkout }
})

function updateCheckout() {
  emit('change', checkoutForm.value)
}
</script>

<template lang="pug">
.order-conformation-form(v-if="checkoutForm")
  .details
    .f
      label Expected Date
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedDate" appendTo="body" showTime hourFormat="24")
        span.material-icons calendar_month
    .f
      label Purchase Order #
      span.input
        prime-inputtext(v-model="checkoutForm.purchaseOrder")
  .notes
    .f
      label Notes
      span.input.notes
        //- TODO Prepopulate
        prime-textarea(v-model="checkoutForm.notes")

</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

</style>

.order-conformation-form
<style lang="sass" scoped>
@import "@/assets/styles/includes"

.order-conformation-form
  width: 40rem
  padding: $s
  .address .f
    &:last-child
      border-bottom: none
  .f
    +flex
    align-items: flex-start
    padding: $s25 $s
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.05)
    label
      width: 10rem
      font-weight: 500
      display: inline-block
    span.input
      flex: 1
      position: relative
      width: 18rem
      max-width: 15rem
      &.notes > *
        width: 25rem
      span.material-icons
        +absolute-e
        right: $s50
        margin: $s25 0
        color: rgba($sgs-gray, 0.4)
</style>
