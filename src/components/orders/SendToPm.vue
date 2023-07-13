<script lang="ts" setup>
import { faker } from '@faker-js/faker'
import ColorsTableEdit from './ColorsTableEdit.vue'
import { inject, ref, computed, watch } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'submit'])

const options = inject('options')
const sendForm = ref(props.order)
const isFormVisible = computed(() => !!props.order)

watch(() => props.order, (order) => {
  sendForm.value = { ...order }
})

function init() {
  emit('create')
}

function submit() {
  emit('submit', sendForm)
}
</script>

<template lang="pug">
.send-to-pm
  .cta
    small Cannot find your order?&nbsp;
    a(@click="init()")
      small Send to PM
  prime-dialog(v-model:visible="isFormVisible" modal :style="{ width: '80vw' }" header="Send to PM")
    .content
      main
        .fields
          .field-group
            .f
              label(for="name") Printer
              strong ABC INC
            .f
              label(for="location") Location
              prime-dropdown(:options="options.locations" v-model="sendForm.location")
              //- strong {{ faker.address.city() }}
        .divider
        h4 Items Details
        .fields
          .field-group
            .f
              label(for="brand") Brand
              prime-inputtext#brand(v-model="sendForm.brand" name="brand")
            .f
              label(for="description") Product Description
              prime-inputtext#description(v-model="sendForm.description" name="description")
            .f
              label(for="pack_type") Pack Type
              prime-inputtext#pack_type(v-model="sendForm.packType" name="pack_type")
            .f
              label(for="purchase_order") Purchase Order #
              prime-inputtext#purchase_order(v-model="sendForm.purchaseOrder" name="purchase_order")
            .f
              label(for="item_code") Item Code
              prime-inputtext#item_code(v-model="sendForm.itemCode" name="item_code")
            .f
              label(for="plate_id") Plate ID
              prime-inputtext#plate_id(v-model="sendForm.plateId" name="plate_id")
            .f
              label(for="code") Code #
              .field-group
                prime-dropdown#code-type(v-model="sendForm.carrierCode.type" name="code-type" :options="options.imageCarrierCodeTypes" optionLabel="label" optionValue="value")
                prime-inputtext#code(v-model="sendForm.carrierCode.code" name="code")
            .f
              label(for="job_number") SGS Job #
              prime-inputtext#job_number(v-model="sendForm.jobNumber" name="job_number")
        .fields
        .divider
        colors-table-edit
        .divider
        .fields
          .f
            label(for="comments") Comments
            prime-textarea#comments(v-model="sendForm.comments" name="comments" rows="10")
      aside
        label.drop-zone(for="files")
          input#files(type="file" name="files")
          span Drag &amp; Drop files here ...
    template(#footer)
      .actions
        sgs-button(label="Send" :icon="loading ? 'progress_activity' : 'send'" :iconClass="loading ? 'spin' : ''" @click="submit" iconPosition="right")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.content
  padding: $s2
  min-height: 80vh
  +flex-fill
  align-items: stretch
  main
    flex: 1
  aside
    width: 25rem
    padding: 0 $s
    margin-left: $s
    border-left: 1px solid rgba($sgs-gray, 0.1)

.cta
  +flex
  margin: 0 $s

.fields
  .field-group
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: $s
    .f
      label
        display: block
        opacity: 0.7
        font-size: 0.9rem
        margin-bottom: $s25

.actions
  +flex($h: right)
  padding-top: $s50
  margin-top: $s50
  border-top: 1px solid rgba($sgs-gray, 0.2)

.drop-zone
  min-height: 20rem
  margin: $s
  border: 1px dashed rgba($sgs-gray, 0.3)
  border-radius: 5px
  +flex(center, center)
  input[type="file"]
    display: none
  &:hover
    border: 1px dashed rgba($sgs-gray, 1)
</style>
