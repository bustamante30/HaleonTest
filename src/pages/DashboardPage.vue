<!-- eslint-disable vue/v-on-event-hyphenation -->
<!-- eslint-disable vue/no-unused-vars -->
<!-- eslint-disable vue/no-v-model-argument -->
<!-- eslint-disable vue/attribute-hyphenation -->
<template lang="pug">
.page.dashboard(:class="{ 'dark':!isValidIdentityProvider }")
  sgs-scrollpanel(v-if="isValidIdentityProvider" :scroll="false")
    main
      sgs-scrollpanel(:scroll="false")
        template(#header)
          welcome(:user="username")
          header
            .title 
              h1(v-if="searchExecuted") Search Results 
              h1(v-if="!searchExecuted") Recent Orders 
            .date-range(v-if="!searchExecuted")
              prime-dropdown.sm.rangeFilter(
v-model="selectedDate" name="datefilter" :options="dateFilter" appendTo="body"
                optionLabel="label" optionValue="value" @change="changeDateFilter")
            .statuses(v-if="!searchExecuted")
              prime-listbox.sm(id="statusListbox" v-model="selectedStatus" aria-label="status" :options="statusList" optionLabel="name" @change="searchByStatus" )
            .my-orders(v-if="!searchExecuted")
              .switch
                label(for="my-orders") My orders
                prime-input-switch.checkbox.sm(v-model="showMyOrders" inputId="my-orders" @change="handleOrderToggle")
            .search
              orders-search(:config="userFilterConfig" :filters="filters" :userType="userType" @search="search" @searchkeyword="searchKeyword")
            .send-to-pm
              template(v-if="userType === 'EXT'")
                send-pm(:order="pmOrder" :loading="savingPmOrder" @create="createPmOrder")
          .search-tag(v-if="searchTags.length > 0")
            .tag(v-for="(tag ,index) in searchTags" :key="tag")
              span {{tag}}
              span.pi.pi-times.icon(@click="clearSearchTags(index)") 
            .tag(v-if="searchTags.length > 0")
              span Clear All
              span.pi.pi-times.icon(@click="clearAllSearchTags") 
        orders-table(
:config="config" :data="orders" :userType="userType" :showMultipleSelection="showMultipleSelection" :status="selectedStatus" :loading="loadingOrders" @add="addToCart"
        @reorder="reorder" @cancel="cancelOrder" @audit="auditOrder" @addMultipleToCart="addMultipleToCart" @ordervalidation ="handleOrderValidation")
      prime-confirm-dialog
        template(#message="slotProps")
          div.dialogLayout
            i(:class="slotProps.message.icon" style="font-size: 1.5rem;margin-right:0.5rem;")
            p(:class="pl-2") {{ slotProps.message.message }}
      prime-dialog.audit(v-model:visible="isAuditVisible" closable modal :style="{ width: '75rem', overflow: 'hidden' }")
        template(#header)
          header
            h4 Reorder Audit - {{auditReorderId}}
        reorder-audit.audit(:data="auditData")
      prime-dialog(v-model:visible="showConfirmDialog" :header="'Order Validation'" closable modal :style="{ width: '70rem', overflow: 'hidden' }")
        template(#message="slotProps")
        span.sendtoPm 
          | Sorry something went wrong on our end. Please contact a PM directly, or please go to  
          send-pm(:order="pmOrder" :loading="savingPmOrder" :OrderValidation="true" @create="createPmOrder" ) 
          | to place your request
      prime-dialog(v-model:visible="showCartConfirmDialog" :header="'Order Cart Validation'" closable modal :style="{ width: '70rem', overflow: 'hidden' }")
        template(#message="slotProps")
        span.sendtoPm 
          | Sorry, something went wrong on our end. {{ sgsJobId }} was unable to be  added to your cart.Please contact a PM directly, or please go to 
          send-pm(:order="pmOrder" :loading="savingPmOrder" :OrderValidation="true" @create="createPmOrder") 
          | to place your request
         
    router-view
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable no-undef -->
<script setup lang="ts">
import OrdersTable from "@/components/orders/OrdersTable.vue";
import OrdersSearch from "@/components/orders/OrdersSearch.vue";
import ReorderAudit from "@/components/orders/ReorderAudit.vue";
import welcome from "../components/common/Welcome.vue";
import config from "@/data/config/orders-table";
import { filterConfig } from "@/data/config/order-filters";
import { useOrdersStore } from "@/stores/orders";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useSendToPmStore } from "@/stores/send-to-pm";
import SendPm from "@/components/orders/SendToPm.vue";
import { useConfirm } from "primevue/useconfirm";
import { useNotificationsStore } from "@/stores/notifications";
import router from "@/router";
import ReorderService from "@/services/ReorderService";
import { useRoute } from "vue-router";

const notificationsStore = useNotificationsStore();
const confirm = useConfirm();
const ordersStore = useOrdersStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const sendToPmStore = useSendToPmStore();
const authb2cStore = useB2CAuthStore();
const showConfirmDialog = ref(false);
const showCartConfirmDialog = ref(false);

const currentUser = computed(() => authStore.currentUser);
const currentB2CUser = computed(() => authb2cStore.currentB2CUser);
const userType = computed(() => {
  const currentUser = authStore.currentUser;
  if (currentUser.email !== "" && currentUser.userType != null) {
    return currentUser.userType;
  }

  const currentB2CUser = authb2cStore.currentB2CUser;
  if (currentB2CUser.email !== "" && currentB2CUser.userType != null) {
    return currentB2CUser.userType;
  }
});

const username = computed(
  () =>
    `${authStore.currentUser.firstName || "John"} ${
      authStore.currentUser.lastName || "Doe"
    }`,
);
const isAuditVisible = ref(false);
const sgsJobId = ref("");
const auditReorderId = ref();
const auditData = ref();
const selectedDate = ref(() => dateFilter.value[0]);
const selectedStatus = ref();
const showMyOrders = ref(true);
const dateFilter = computed(() => getDateFilter());
const statusList = computed(() => ordersStore.statusList);
const orders = computed(() => ordersStore.orders);
const options = computed(() => ordersStore.options);
const filters = computed(() => ordersStore.filters);
const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const isValidIdentityProvider = computed(() => {
  if (isb2cUserLoggedIn.value || isUserLoggedIn.value) {
    return true;
  }
  return false;
});
const userFilterConfig = computed(() => filterConfig());
const loadingOrders = computed(() => ordersStore.loading.ordersList);
const pmOrder = computed(() => sendToPmStore.newOrder);
const savingPmOrder = computed(() => sendToPmStore.loading);
const roleKey = computed(() => {
  if (authStore.currentUser.roleKey) {
    return authStore.currentUser.roleKey;
  }
  if (authb2cStore.currentB2CUser.roleKey) {
    return authb2cStore.currentB2CUser.roleKey;
  }
});
const showMultipleSelection = ref(false);
const searchExecuted = ref(false);
const searchTags = ref([]);

provide("options", options);

const init = () => {
  showMyOrders.value = true;
  initClearAllSearchTags();
  ordersStore.initAdvancedFilters();
  selectedStatus.value = statusList.value[0];
  changeDateFilter(dateFilter.value[0]);
  isAdminAddDraftTab();
  ordersStore.firstLoad = true;
};
onMounted(() => {
  init();
});
const route = useRoute();
// Watch for query change and refersh the dashboad thro. init()
watch(
  () => route.query["q"],
  () => {
    init();
  },
);

watch(currentUser, () => {
  if (authStore.currentUser.isLoggedIn && !ordersStore.firstLoad) {
    ordersStore.firstLoad = true;
    ordersStore.initAdvancedFilters();
    changeDateFilter(dateFilter.value[0]);
  }
  isAdminAddDraftTab();
});
watch(currentB2CUser, () => {
  if (authb2cStore.currentB2CUser.isLoggedIn && !ordersStore.firstLoad) {
    ordersStore.firstLoad = true;
    ordersStore.initAdvancedFilters();
    changeDateFilter(dateFilter.value[0]);
  }
  isAdminAddDraftTab();
});

function isAdminAddDraftTab() {
  const exists = statusList.value.some((obj) => obj.name === "Draft");
  if (
    !exists &&
    (roleKey.value === "PrinterAdmin" || roleKey.value === "PMSuperAdminUser")
  )
    statusList.value.push({ name: "Draft", value: 1 });
}

function getDateFilter(): [string, string] {
  let filter: any = [];
  // filter.push({ label: "last 3 days", value: "last 3 days" });
  filter.push({ label: "last 3 months", value: "last 3 months" });
  for (let i = new Date().getFullYear(); i > 2019; i--) {
    filter.push({
      label: i.toString(),
      value: i.toString(),
    });
  }
  return filter;
}
function getDateRange(filter: string) {
  if (filter === "last 3 months") {
    let monthFilter = new Date(Date.now() - 7776000000);
    return [monthFilter, new Date()];
  }
  if (!isNaN(Number(filter))) {
    let i = Number(filter);
    return [new Date(i, 0, 1), new Date(i + 1, 0, 1)];
  }
  let threeDaysDate = new Date(Date.now() - 259200000);
  return [threeDaysDate, new Date()];
}
function changeDateFilter(dtFilter: any) {
  filters.value.myOrdersToggled = showMyOrders.value;
  filters.value.isAdvancedSearch = false;
  selectedDate.value = dtFilter.value;
  filters.value.startDate = getDateRange(dtFilter.value);
  filters.value.status = selectedStatus.value.value;
  addPrinterFilter();
  ordersStore.setFilters(filters.value);
}

function addPrinterFilter() {
  console.log("printer: " + authb2cStore.currentB2CUser.printerName);
  const printerName = authb2cStore.currentB2CUser.isLoggedIn
    ? authb2cStore.currentB2CUser.printerName
    : null;
  if (printerName && !filters.value.printerName)
    filters.value.printerName = printerName;
}

function handleOrderToggle() {
  filters.value.startDate = getDateRange(selectedDate.value.toString());
  filters.value.status = selectedStatus.value.value;
  const toggleFilter = {
    ...filters.value,
    myOrdersToggled: showMyOrders.value,
    isAdvancedSearch: false,
  };
  ordersStore.setFilters(toggleFilter);
}
function searchByStatus() {
  if (!selectedStatus?.value?.value) return;
  ordersStore.initAdvancedFilters();
  filters.value.startDate = getDateRange(selectedDate.value.toString());
  filters.value.status = selectedStatus?.value?.value;
  filters.value.myOrdersToggled = showMyOrders.value;
  filters.value.isAdvancedSearch = false;
  addPrinterFilter();
  ordersStore.setFilters(filters.value);
}
function searchKeyword(event: any) {
  showMyOrders.value = false;
  if (event) {
    searchExecuted.value = true;
    searchTags.value = event.query.split(",");
    const fil = {
      ...filters.value,
      myOrdersToggled: false,
      isAdvancedSearch: false,
      printerName: null,
      status: 4,
      query: event.query,
    };
    ordersStore.setFilters(fil);
  } else {
    filters.value.myOrdersToggled = false;
    filters.value.isAdvancedSearch = false;
    searchTags.value = [];
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
    searchExecuted.value = false;
  }
}
function search(filters: any) {
  showMyOrders.value = false;
  searchExecuted.value = true;
  ordersStore.pageState.page = 1;
  searchTags.value = [];
  filters.query = "";

  if (filters) {
    if (!selectedStatus.value) selectedStatus.value = statusList.value[0];
    else {
      if (filters.status !== selectedStatus.value.value) {
        selectedStatus.value = statusList.value.find(
          (x) => x.value === filters.status,
        );
      }
    }
    addPrinterFilter();
    ordersStore.setFilters(filters);
  } else {
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
  }
}

const clearSearchTags = (index: number) => {
  searchTags.value.splice(index, 1);
  if (searchTags.value.length === 0) {
    filters.value.query = "";
    selectedStatus.value = statusList.value[0];
    changeDateFilter(dateFilter.value[0]);
    searchExecuted.value = false;
  } else {
    const fil = {
      ...filters.value,
      query: searchTags.value.join(","),
    };
    addPrinterFilter();
    ordersStore.setFilters(fil);
  }
};

const clearAllSearchTags = () => {
  initClearAllSearchTags();
  changeDateFilter(dateFilter.value[0]);
};

const initClearAllSearchTags = () => {
  searchTags.value = [];
  filters.value.query = "";
  searchExecuted.value = false;
  selectedStatus.value = statusList.value[0];
};

function createPmOrder() {
  sendToPmStore.initNewOrder();
  sendToPmStore.getCodeTypes();
  sendToPmStore.getPackTypes();
  sendToPmStore.getPlateTypes();
}

async function addToCart(order: any) {
  confirm.require({
    message: "Do you want to add more orders to the cart?",
    header: "Add more Orders",
    icon: "pi pi-info-circle",
    accept: async () => {
      order.selected = true;
      showMultipleSelection.value = true;
      (
        document.getElementsByClassName(
          "p-image-preview-indicator",
        )[0] as HTMLElement
      )?.focus();
    },
    reject: async () => {
      ordersStore.loading.ordersList = true;
      const result = await ReorderService.validateOrder(order.sgsId);
      if (result === false) {
        if (userType.value === "EXT") {
          sendToPmStore.externalPrinterName =
            authb2cStore.currentB2CUser.printerName;
          sgsJobId.value = order.sgsId;
          showCartConfirmDialog.value = true;
          sendToPmStore.isValidated = true;
        } else {
          notificationsStore.addNotification(
            `Info`,
            "There are no flexo items listed for the job you have selected.  Please place your image carrier reorder request directly in MySGS",
            { severity: "error" },
          );
        }
      } else {
        addOrderToCart(order.sgsId);
      }
      ordersStore.loading.ordersList = false;
    },
  });
}
async function reorder(order: any) {
  const result = await ReorderService.validateOrder(order.sgsId);
  if (result === false) {
    if (userType.value === "EXT") {
      sendToPmStore.externalPrinterName =
        authb2cStore.currentB2CUser.printerName;
      // Validation failed, show the confirm  dialog
      showConfirmDialog.value = true;
      sendToPmStore.isValidated = true;
    } else {
      notificationsStore.addNotification(
        `Info`,
        "There are no flexo items listed for the job you have selected.  Please place your image carrier reorder request directly in MySGS",
        { severity: "error" },
      );
    }
  } else {
    ordersStore.reorder(order);
  }
}
function cancelOrder(order: any) {
  confirm.require({
    message: "Do you want to cancel this Reorder?",
    header: "Cancel Order",
    icon: "pi pi-info-circle",
    accept: async () => {
      //notificationsStore.addNotification(`Info`, 'Order Cancelled', { severity: 'success' })
      // api
      let orderDetails = JSON.parse(
        JSON.stringify(await ReorderService.getPhotonReorderDetails(order.id)),
      );
      ordersStore.isCancel = true;
      ordersStore.setOrderInStore(orderDetails);
      (
        document.getElementsByClassName(
          "p-image-preview-indicator",
        )[0] as HTMLElement
      )?.focus();
      // Assuming you have a route named "success" for the success page
      await router.push(`/dashboard/${order.id}/success`);
    },
    reject: () => {
      notificationsStore.addNotification(
        `Info`,
        "Order Cancellation Rejected",
        { severity: "error" },
      );
    },
  });

  //ordersStore.cancelOrder(order);
}

const auditOrder = async (order) => {
  const audit = await ReorderService.getReorderAudit(order.id);
  isAuditVisible.value = true;
  auditReorderId.value = order.id;
  auditData.value = audit.results;

  console.log(audit.result);
};

async function addMultipleToCart() {
  ordersStore.loading.ordersList = true;
  let ordersToAdd = ordersStore.orders.filter((x) => x.selected);
  for (let i = 0; i < ordersToAdd.length; i++) {
    let order = ordersToAdd[i];

    const result = await ReorderService.validateOrder(order.sgsId);
    if (result === false) {
      if (userType.value === "EXT") {
        sendToPmStore.externalPrinterName =
          authb2cStore.currentB2CUser.printerName;
        sgsJobId.value = order.sgsId;
        showCartConfirmDialog.value = true;
        sendToPmStore.isValidated = true;
      } else {
        notificationsStore.addNotification(
          `Info`,
          "There are no flexo items listed for the job you have selected.  Please place your image carrier reorder request directly in MySGS",
          { severity: "error" },
        );
      }
    } else {
      addOrderToCart(order.sgsId);
      order.selected = false;
    }
  }
  showMultipleSelection.value = false;
  ordersStore.loading.ordersList = false;
}
async function addOrderToCart(sgsId: any) {
  ordersStore.getOrderById(sgsId).then((orderToAdd: any) => {
    ordersStore.getEditableColors(sgsId, orderToAdd).then(() => {
      console.log("order with lens:", orderToAdd);
      cartStore.addToCart(orderToAdd).then((result: boolean) => {
        if (result)
          notificationsStore.addNotification(
            `Sucesss`,
            "Success adding the order #" + sgsId,
            { severity: "success" },
          );
        else
          notificationsStore.addNotification(
            `Error`,
            "Error adding to the cart #" + sgsId,
            { severity: "error" },
          );
      });
    });
  });
}
async function handleOrderValidation(data: any) {
  const result = await ReorderService.validateOrder(data.originalOrderId);
  if (result === false && showMyOrders.value === false) {
    if (userType.value === "EXT") {
      sendToPmStore.externalPrinterName =
        authb2cStore.currentB2CUser.printerName;
      // Validation failed, show the confirm  dialog
      showConfirmDialog.value = true;
      sendToPmStore.isValidated = true;
    } else {
      notificationsStore.addNotification(
        `Info`,
        "There are no flexo items listed for the job you have selected.  Please place your image carrier reorder request directly in MySGS",
        { severity: "error" },
      );
    }
  } else {
    router.push(data.path);
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.dashboard
  +container
  main
    +container
    padding: $s
    header
      +flex-fill
      gap: $s
      .switch
        +flex
        gap: $s50
        padding: $s25 $s50
        background: #ffffff
        border: 1px solid #ced4da
        border-radius: 3px
        label
          font-size: 0.95rem
          width: 4rem
      .search, .send-to-pm
        justify-content: flex-end
  &.dark
    background: var(--app-header-bg-color)

.search-tag
  display: flex
  align-items: center
  justify-content: flex-start
  gap: 1rem
  padding: 0.5rem
  flex-wrap: wrap
  background: #f8f9fa
  .tag
    display: flex
    align-items: baseline
    justify-content: space-between
    background: rgba(45,42,38,.1)
    padding: 0.5rem
    border-radius: 15px
    border: 1px solid rgba(45,42,38,.1)
    font-size: .9rem
    font-weight: 500
    line-height: 1
    gap:.6rem
    &:last-child
      margin-left: 2rem
    .icon
      font-size: .8rem
      cursor: pointer
.dialogLayout
  display: flex
  align-items: center
  margin: 1rem

.audit
  margin:15px

.sendtoPm
  margin:25px
  display: flex
  align-items: center
</style>
