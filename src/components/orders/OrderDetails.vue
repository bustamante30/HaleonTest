<template lang="pug">
.page.details
  sgs-mask(@click="router.push('/dashboard')")
  .container
    sgs-spinner(v-if="loadingOrder")
    sgs-scrollpanel(v-else-if="selectedOrder")
      template(#header)
        header
          h1.title
            span {{ selectedOrder.brandName ? selectedOrder.brandName : 'N/A' }} / {{ selectedOrder.description ? selectedOrder.description : 'N/A'}}
          a.close(@click="router.push('/dashboard')")
            span.material-icons.outline close
      .card.context
        .details
          h4
            span Item Code: {{ selectedOrder.itemCode ? selectedOrder.itemCode : 'N/A'}}
            span.separator |
            span {{ selectedOrder.packType ? selectedOrder.packType : 'N/A' }}
            span.separator |
            span {{ selectedOrder.printerName ? selectedOrder.printerName : 'N/A' }} 
      .card.summary(v-if="selectedOrder")
        .thumbnail
          prime-image.image(:src="selectedOrder.thumbNailPath" alt="Image" preview :image-style="{ height: '100%', width: 'auto', maxWidth: '100%' }")
          sgs-button#thumbnail.sm(label="View PDF" @click="viewPreview")
        .details
          colors-table.p-datatable-sm(:config="config" :data="colors" :loading="loadingOrder")
      .card
        order-shirttail(:data="selectedOrder")
      .card#preview(ref="preview")
        sgs-panel(v-for="(pdfUri, pdfName) in selectedOrder.pdfData" :key="`${pdfName}`" :header="`${pdfName}`")
          iframe.pdf(:src="pdfUri")
      template(#footer)
        footer
          .secondary-actions &nbsp;
          .actions
            sgs-button#reorder(v-if="selectedOrder.statusId!=2 && selectedOrder.statusId!=3" :disabled="loadingOrder" icon="redo" label="Re-Order" @click="buy()")
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";
import ColorsTable from "./ColorsTable.vue";
import config from "@/data/config/color-table";
import router from "@/router";
import OrderShirttail from "./OrderShirttail.vue";

const preview = ref();

const ordersStore = useOrdersStore();

const props = defineProps({
  selectedId: {
    type: String,
    default: () => "",
  },
});
const selectedOrder = computed(() => ordersStore.selectedOrder);
const loadingOrder = computed(() => ordersStore.loading.order);
const colors = computed(() => ordersStore.selectedOrder.colors);

onMounted(async () => {
  await ordersStore.getOrderById(props.selectedId);
  ordersStore.getEditableColors(props.selectedId, selectedOrder.value);
});

async function buy() {
  if (selectedOrder.value.statusId != 1) {
    selectedOrder.value.id = 0;
  }
  const confirmRoute =
    `/dashboard/${props.selectedId}/reorder` +
    (selectedOrder.value.statusId == 1 ? `?source=cart` : ``);
  console.log(confirmRoute);
  router.push(confirmRoute);
}

function viewPreview() {
  preview?.value?.scrollIntoView();
}
</script>

<style lang="sass">
@import "@/assets/styles/includes"

.p-image-preview-indicator
  height: 4rem
  width: 4rem
  border-radius: 4rem
  max-width: 80%
  max-height: 80%
  margin: auto
  bottom: 0
  right: 0
  .p-icon
    max-width: 80%
    max-height: 80%

.p-image-mask
  z-index: $z-image-mask !important
</style>

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
    width: 85vw
    min-width: 75rem
    background: white
    box-shadow: -10px 0 5px 3px rgba(0, 0, 0, 0.1)
    +container
    z-index: $z-popup-page
    animation: slide 0.2s ease-in
  header
    +flex-fill
    background: rgba($sgs-gray, 0.05)
    padding: $s50 $s
    a.close
      opacity: 0.6
      span.material-icons
        color: $sgs-black
      &:hover
        opacity: 1
  .card
    padding: $s $s2
  .card.context
    +flex-fill
    padding-bottom: 0
  .card.summary
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 25rem
      min-height: 25rem
      > .image
        width: 100%
        margin-bottom: $s
      > button
        margin: 0 auto
    .details
      flex: 1
      padding: 0 $s
      min-height: 25rem
      h2, h3, h4, p
        margin-top: 0
      .printer
        background: rgba($sgs-gray, 0.05)
        padding: $s75 $s

iframe.pdf
  width: 100%
  min-height: 40rem
  margin: $s 0
  border: none
</style>
