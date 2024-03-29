<!-- eslint-disable vue/no-v-model-argument -->
<template lang="pug">
.cart-order
  h2
    span {{ order.brandName }}
    span.separator |
    span {{ order.description }}
  .summary
    .thumbnail
      prime-image.image(
        :src="order.thumbNailPath" alt="Image" preview :image-style="{ height: '100%', width: 'auto', maxWidth: '100%' }")
    .details
      .f
        label Item Code
        span {{ order.itemCode }}
      .f
        label Pack Type
        span {{ order.packType }}
      .f
        label Product Weight
        span {{ order.weight }}
      .f
        label Printer
        span {{ order.printerName }}
      .f
        label Shipping Address
        span  {{ order.address}}
      a.specs(@click="toggleColors") View Specs
      .colors(v-if="isSpecsVisible")
        colors-table.p-datatable-sm(:config="config" :data="colors")
      footer
        .secondary-actions
        .actions
          sgs-button.sm.secondary(:id="`view-order-${order.id}`" label="View Order"  @click="goto(`/dashboard/${order.id}`)" )
          sgs-button.sm.secondary(:id="`audit-order-${order.id}`" v-tooltip.bottom="{ value: 'View Audit' }"  icon="visibility"  @click="auditOrder(order)" )
          sgs-button.sm.alert.secondary(:id="`discard-order-${order.id}`"  v-tooltip.bottom="{ value: 'Discard Order' }"  icon="delete"  @click="discardOrder(order)" )
  prime-dialog.audit(v-model:visible="isAuditVisible" closable modal :style="{ width: '75rem', overflow: 'hidden' }")
    template(#header)
      header
        h4 Reorder Audit - {{auditReorderId}}
    reorder-audit.audit(:data="auditData")
</template>

<script setup>
import { ref, computed } from "vue";
import ColorsTable from "@/components/orders/ColorsTable.vue";
import ReorderAudit from "@/components/orders/ReorderAudit.vue";
import config from "@/data/config/color-table";
import router from "@/router";
import { useCartStore } from "@/stores/cart";
import { useConfirm } from "primevue/useconfirm";
import ReorderService from "@/services/ReorderService";
import { useNotificationsStore } from "@/stores/notifications";
import { Logger } from "@/logger/logger";

const logger = new Logger("stores-auth");

const props = defineProps({
  order: {
    type: Object,
    default: () => {},
  },
});

const confirm = useConfirm();
const colors = computed(() => props.order.colors);
const isSpecsVisible = ref(false);
const cartStore = useCartStore();

const isAuditVisible = ref(false);
const auditReorderId = ref();
const auditData = ref();
const notificationsStore = useNotificationsStore();
const auditOrder = async (order) => {
  let response = await ReorderService.getReorderAudit(order.id);
  if (response.result) {
    const audit = response.data;
    isAuditVisible.value = true;
    auditReorderId.value = order.id;
    auditData.value = audit.results;
  } else {
    notificationsStore.addNotification(
      `Error`,
      response.exceptionDetails.Message,
      { severity: "error", life: 5000 },
    );
    console.error(response);
    logger.error(response);
  }
};

function toggleColors() {
  isSpecsVisible.value = !isSpecsVisible.value;
}

function goto(path) {
  router.push(path);
}
async function discardOrder(order) {
  confirm.require({
    message: "Are you sure you want to discard this draft?",
    header: "Confirmation - Discard Draft",
    icon: "pi pi-info-circle",
    acceptClass: "p-button-danger",
    acceptIcon: "pi pi-check",
    rejectIcon: "pi pi-times",
    accept: async () => {
      await cartStore.discardOrder(order.id);
    },
    reject: () => {},
  });
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.cart-order
  padding: $s
  border-bottom: 1px solid rgba($sgs-gray, 0.2)
  h2
    margin-bottom: $s
  .summary
    +flex-fill
    align-items: flex-start
    .thumbnail
      width: 16rem
      > *
        width: 100%
    .details
      flex: 1
      padding: $s
      h2, h3, h4, p
        margin-top: 0
      .printer
        background: rgba($sgs-gray, 0.05)
        padding: $s75 $s

  .f
    padding: $s25 0
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.1)
    label
      font-weight: 500
      width: 10rem
      display: inline-block
      &:after
        content: ":"
        margin-right: $s50
        display: inline-block

a.specs
  font-size: 0.9rem
  font-weight: 500
  display: inline-block
  padding: $s 0
</style>
