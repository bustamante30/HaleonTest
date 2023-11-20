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
            .export-excel
              template(v-if="roleKey === 'PrinterAdmin'")
                sgs-button.default(icon = 'Download' @click= "exportToExcel")
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
:config="config" :data="orders" :userType="userType" :role ="roleKey" :showMultipleSelection="showMultipleSelection" :status="selectedStatus" :loading="loadingOrders" @add="addToCart"
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
import * as Constants from "@/services/Constants";

const notificationsStore = useNotificationsStore();
const confirm = useConfirm();
const ordersStore = useOrdersStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const sendToPmStore = useSendToPmStore();
const authb2cStore = useB2CAuthStore();
const showConfirmDialog = ref(false);

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
// Watch for query change and refresh the dashboad thro. init()
watch(
  () => route.query["q"],
  () => {
    init();
  },
);
watch(
  () => route.query["showPM"],
  (showPM) => {
    if (showPM === "true") createPmOrder();
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
  let sgsId: any;
  confirm.require({
    message: "Do you want to add more orders to the cart?",
    header: "Add more Orders",
    icon: "pi pi-info-circle",
    accept: async () => {
      orders.value.forEach((o: any) => {
        if (o.id === 0 || o.selected === true) {
          o.selected = false;
        }
      });

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
      if (showMyOrders.value === true) {
        sgsId = order.sgsId;
      } else {
        sgsId = order.originalOrderId ? order.originalOrderId : order.sgsId;
      }
      addMultipleToCart(sgsId);
      ordersStore.loading.ordersList = false;
    },
  });
}
async function reorder(order: any) {
  const response = await ReorderService.validateOrder(
    order.originalOrderId ? order.originalOrderId : order.sgsId,
  );
  if (response.result) {
    if (response.data === false) {
      if (userType.value === "EXT") {
        sendToPmStore.externalPrinterName =
          authb2cStore.currentB2CUser.printerName;
        // Validation failed, show the confirm  dialog
        showConfirmDialog.value = true;
        sendToPmStore.isValidated = true;
      } else {
        notificationsStore.addNotification(
          Constants.INFO,
          Constants.FLEXO_ERROR,
          { severity: "error" },
        );
      }
    } else {
      ordersStore.reorder(order);
    }
  } else {
    notificationsStore.addNotification(
      `Error`,
      response.exceptionDetails?.Message,
      { severity: "error", life: 5000 },
    );
  }
}
function cancelOrder(order: any) {
  confirm.require({
    message: "Do you want to cancel this Reorder?",
    header: "Cancel Order",
    icon: "pi pi-info-circle",
    accept: async () => {
      let response = await ReorderService.getPhotonReorderDetails(order.id);
      if (response.result) {
        let orderDetails = JSON.parse(JSON.stringify(response.data));
        ordersStore.isCancel = true;
        ordersStore.setOrderInStore(orderDetails);
        (
          document.getElementsByClassName(
            "p-image-preview-indicator",
          )[0] as HTMLElement
        )?.focus();
      } else {
        notificationsStore.addNotification(
          Constants.FAILURE,
          response.exceptionDetails.Message,
          { severity: "error", life: 5000 },
        );
        return false;
      }
      // Assuming you have a route named "success" for the success page
      await router.push(`/dashboard/${order.id}/success`);
    },
  });
}

const auditOrder = async (order) => {
  let response = await ReorderService.getReorderAudit(order.id);
  if (response.result) {
    const audit = response.data;
    isAuditVisible.value = true;
    auditReorderId.value = order.id;
    auditData.value = audit.results;
  } else {
    notificationsStore.addNotification(
      Constants.FAILURE,
      response.exceptionDetails.Message,
      { severity: "error", life: 5000 },
    );
    console.error(response);
  }
};

async function addMultipleToCart(sgsId: null) {
  ordersStore.loading.ordersList = true;
  let ordersToAdd = ordersStore.orders;
  let orderSgsId: any;

  if (sgsId !== null) {
    if (!Array.isArray(sgsId)) {
      ordersToAdd = ordersToAdd.filter((x) => x.sgsId === sgsId);
    } else {
      ordersToAdd = ordersStore.orders.filter((x) => x.selected);
    }
  }

  const errorMessages: string[] = [];
  const validOrders: any[] = [];
  let failedOrdersMessage: string;

  const validationPromises = ordersToAdd.map(async (order) => {
    try {
      if (showMyOrders.value === true) {
        order.id = 0;
        orderSgsId = order.originalOrderId;
      } else {
        orderSgsId = order.originalOrderId
          ? order.originalOrderId
          : order.sgsId;
      }
      const response = await ReorderService.validateOrder(orderSgsId);
      if (response.result) {
        if (response.data === true) {
          validOrders.push(order);
        } else {
          errorMessages.push(order.sgsId);
        }
      } else {
        notificationsStore.addNotification(
          `Error`,
          response.exceptionDetails?.Message,
          { severity: "error", life: 5000 },
        );
      }
    } catch (error) {
      console.error("[Error while validating the order]: ", error);
    }
  });

  // Execute all validation api calls in parallel
  const validationResults = await Promise.allSettled(validationPromises);

  // Show error messages for both external and internal user's

  if (validationResults != null) {
    if (userType.value === "INT") {
      if (errorMessages.length > 0) {
        failedOrdersMessage = `${
          Constants.INTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART
        } ${errorMessages.join(", ")} ${
          Constants.INTERNAL_FLEXO_VALIDATION_MSG_SECPART
        }`;
        notificationsStore.addNotification(
          Constants.INFO,
          failedOrdersMessage,
          {
            severity: "error",
            life: 6000,
          },
        );
      }
    } else if (userType.value === "EXT") {
      if (errorMessages.length > 0) {
        failedOrdersMessage = `${
          Constants.EXTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART
        } ${errorMessages.join(", ")} ${
          Constants.EXTERNAL_FLEXO_VALIDATION_MSG_SECPART
        }`;
        let link: string = `/dashboard?showPM=true`;
        const linkLabel: string = `Here`;

        notificationsStore.addNotification(
          Constants.INFO,
          failedOrdersMessage,
          {
            severity: "error",
            life: 6000,
            link,
            linkLabel,
          },
        );
      }
    }
  }

  if (validOrders.length > 0) {
    ordersToAdd = validOrders;
    const cartAddRequest = ordersToAdd.map((order) => {
      return {
        originalOrderId: order.originalOrderId
          ? order.originalOrderId
          : order.sgsId,
        reOrders: {
          originalOrderId: order.originalOrderId
            ? order.originalOrderId
            : order.sgsId,
          id: order.id,
          sgsId: order.sgsId,
          brandName: order.brandName,
          description: order.description,
          weight: order.weight,
          printerId: order.printerId,
          printerName: order.printerName,
          itemCode: order.itemCode,
          packType: order.packType,
          createdAt: order.createdAt,
          submittedDate: null,
          cancelledDate: order.cancelledDate,
          createdBy: order.createdBy,
          statusId: 1,
          orderStatus: order.orderStatus,
          thumbNailPath: null,
          colors: null,
        },
      };
    });

    const response = await ReorderService.addOrdersToCart(cartAddRequest);
    if (response.result) {
      if (Array.isArray(response.data)) {
        for (const cartResponse of response.data) {
          console.log(
            `ReorderID: ${cartResponse.reorderId}, Status: ${cartResponse.status}`,
          );
          if (cartResponse.status === "Success") {
            notificationsStore.addNotification(
              Constants.SUCCESS,
              cartResponse.message + "",
              { severity: "success", life: 10000 },
            );
            cartStore.getCartCount();
          } else {
            notificationsStore.addNotification(
              Constants.FAILURE,
              cartResponse.message + "" + cartResponse.originalOrderId,
              { severity: "error", life: 10000 },
            );
          }
        }
      } else {
        console.error("[Cart response error] Response is not an array");
      }
    } else {
      notificationsStore.addNotification(
        Constants.FAILURE,
        response.exceptionDetails?.Message || "Error",
        { severity: "error", life: 5000 },
      );
    }
  }
  showMultipleSelection.value = false;
  ordersStore.loading.ordersList = false;
}
async function handleOrderValidation(data: any) {
  const response = await ReorderService.validateOrder(data.originalOrderId);
  if (response.result) {
    if (response.data === false && showMyOrders.value === false) {
      if (userType.value === "EXT") {
        const errorMessage = `${Constants.EXTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART} ${data.originalOrderId} ${Constants.EXTERNAL_FLEXO_VALIDATION_MSG_SECPART}`;
        let link: string = `/dashboard?showPM=true`;
        const linkLabel: string = `Here`;
        notificationsStore.addNotification(Constants.INFO, errorMessage, {
          severity: "error",
          life: 6000,
          link,
          linkLabel,
        });
      } else {
        notificationsStore.addNotification(
          Constants.INFO,
          `${Constants.INTERNAL_FLEXO_VALIDATION_MSG_FIRSTPART} ${Constants.INTERNAL_FLEXO_VALIDATION_MSG_SECPART}`,
          { severity: "error" },
        );
      }
    } else {
      router.push(data.path);
    }
  } else {
    notificationsStore.addNotification(
      `Error`,
      response.exceptionDetails?.Message,
      { severity: "error", life: 5000 },
    );
  }
}

async function exportToExcel() {
  if (!selectedStatus?.value?.value) return;
  ordersStore.initAdvancedFilters();
  filters.value.startDate = getDateRange(selectedDate.value.toString());
  filters.value.status = selectedStatus?.value?.value;
  filters.value.myOrdersToggled = showMyOrders.value;
  filters.value.isAdvancedSearch = false;
  addPrinterFilter();
  ordersStore.exportToExcel(filters.value);
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
