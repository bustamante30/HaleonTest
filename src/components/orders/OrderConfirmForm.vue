<script lang="ts" setup>
import { DateTime } from 'luxon';
import { onBeforeMount,computed,ref, watch } from 'vue';

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
  emit('change', { purchaseOrder:checkoutForm.value.purchaseOrder,expectedDate:checkoutForm.value.expectedDate,expectedTime: checkoutForm.value.expectedTime })
}

function minSelectableDate() {
  return DateTime.now().plus({ hour: 72 }).startOf('hour').toJSDate()
}
const userType = ref(localStorage.getItem('userType'));

const validSpecialCharacters = ['-', '_', '/', '\\', '#', '.', ',', '+', '&', '(', ')', ' ', ':', ';', '<', '>', '\''];

const errorMessages = {
  minLength: 'Please enter at least 3 characters in the purchase order field.',
  maxLength: 'The Purchase order field cannot exceed 30 characters.',
  invalidCharacters: 'The Purchase order field contains invalid special characters. Only the following special characters are allowed: - _ / \\ # . , + & ( ) " : ; < > \'',
};

function validatePurchaseOrder(): string {
  const purchaseorder = checkoutForm.value.purchaseOrder;  
  if (purchaseorder === null) {
    return "";
  }

  if (purchaseorder.length < 3) {
    return errorMessages.minLength;
  }
  
  if (purchaseorder.length > 30) {
    return errorMessages.maxLength;
  }
  
  for (let i = 0; i < purchaseorder.length; i++) {
    if (!validSpecialCharacters.includes(purchaseorder[i]) && !/^[a-zA-Z0-9]$/.test(purchaseorder[i])) {
      return errorMessages.invalidCharacters;
    }
  }
 return "";
}
function showNotes(): boolean {

  return userType.value === 'External';
}

const isExpectedTimeDisabled = computed(() => {
  return !checkoutForm.value.expectedDate;
});

</script>

<template lang="pug">
.order-conformation-form(v-if="checkoutForm" @change="updateCheckout()")
  .details
    .f
      label Delivery Date *
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedDate" :minDate="minSelectableDate()" showIcon appendTo="body" hourFormat="12" required="true")
    .f
      label Delivery time *
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedTime" :disabled="isExpectedTimeDisabled" timeOnly appendTo="body" hourFormat="24")
    .f
      label Purchase Order #
      span.input
        prime-inputtext(v-model="checkoutForm.purchaseOrder" :class="{'invalid': (checkoutForm.purchaseOrder)}")
        span.warning-message(v-if="validatePurchaseOrder()") {{ validatePurchaseOrder() }}
  .notes(v-if="showNotes()")
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

      span.warning-message
        color: red
        font-weight: bolder
        font-size: 14px
  
</style>
