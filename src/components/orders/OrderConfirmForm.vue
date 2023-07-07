<script lang="ts" setup>
import { DateTime } from 'luxon';
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
  // console.log("date",checkoutForm.value.expectedDate)
  // console.log("time",checkoutForm.value.expectedTime)
  // console.log("purchase",checkoutForm.value.purchaseOrder)
 // emit('change', { purchaseOrder:checkoutForm.value.purchaseOrder,expectedDate:checkoutForm.value.expectedDate,expectedTime: checkoutForm.value.expectedTime })
}

function minSelectableDate() {
  return DateTime.now().plus({ hour: 72 }).startOf('hour').toJSDate()
}
const userType = ref(localStorage.getItem('userType'));

const validSpecialCharacters = ['-', '_', '/', '\\', '#', '.', ',', '+', '&', '(', ')', ' ', ':', ';', '<', '>', '\''];

const errorMessages = {
  minLength: 'Please enter at least 3 characters in the Purchase Order field.',
  maxLength: 'The Purchase Order field cannot exceed 30 characters.',
  invalidCharacters: 'The Purchase Order field contains invalid special characters. Only the following special characters are allowed: - _ / \\ # . , + & ( ) " : ; < > \'',
};

function validatePurchaseOrder(): string {
  emit('change', { purchaseOrder:checkoutForm.value.purchaseOrder,expectedDate:checkoutForm.value.expectedDate,expectedTime: checkoutForm.value.expectedTime })
  const po = checkoutForm.value.purchaseOrder;
  console.log("po", po);
  console.log("usrttype",userType.value)
  
  if (po === null) {
    return "";
  }

  if (po.length < 3) {
    return errorMessages.minLength;
  }
  
  if (po.length > 30) {
    return errorMessages.maxLength;
  }
  
  for (let i = 0; i < po.length; i++) {
    if (!validSpecialCharacters.includes(po[i]) && !/^[a-zA-Z0-9]$/.test(po[i])) {
      return errorMessages.invalidCharacters;
    }
  }
 return "";
}

</script>

<template lang="pug">
.order-conformation-form(v-if="checkoutForm" @change="updateCheckout()")
  .details
    .f
      label Expected Date *
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedDate" :minDate="minSelectableDate()" showIcon appendTo="body" hourFormat="12" required="true" @input="updateCheckout")
    .f
      label Expected time *
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedTime" timeOnly appendTo="body" hourFormat="24" @input="updateCheckout")
    .f
      label Purchase Order #
      span.input
        prime-inputtext(v-model="checkoutForm.purchaseOrder" :class="{'invalid': (checkoutForm.purchaseOrder)}")
        span.warning-message(v-if="validatePurchaseOrder()") {{ validatePurchaseOrder() }}
  .notes
    .f
      label(v-if="userType.value === 'External'") Notes
      span.input.notes
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

      span.warning-message
        color: rgba(255, 0, 0, 0.7)
        font-weight: bold
  
</style>
