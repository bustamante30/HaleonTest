<script setup lang="ts">
import { computed, onBeforeMount, provide, reactive, ref, onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import OrdersTable from "@/components/orders/OrdersTable.vue";
import OrdersSearch from "@/components/orders/OrdersSearch.vue";
import welcome from "../components/common/Welcome.vue";
import config from "@/data/config/orders-table";
import { keys } from "lodash";
import { filterConfig } from "@/data/config/order-filters";

import { useOrdersStore } from "@/stores/orders";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import Paginator from "primevue/paginator";
import * as pagination from "primevue/paginator";
import { useSendToPmStore } from "@/stores/send-to-pm";
import SendPm from "@/components/orders/SendToPm.vue";

const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const sendToPmStore = useSendToPmStore();
const authb2cStore = useB2CAuthStore();

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
    }`
);

const dateFilter = computed(() => getDateFilter());
const selectedDate = ref(() => dateFilter.value[0]);
const statusList = computed(() =>
  ordersStore.statusList.filter((x) => x.value > 1)
);
const selectedStatus = ref();
const orders = computed(() => ordersStore.orders);
const options = computed(() => ordersStore.options);
const filters = computed(() => ordersStore.filters);
const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const isValidIdentityProvider = computed(() => {
  if(isb2cUserLoggedIn.value){
    return authb2cStore.isValidIdentityProvider;
  }
  else if(isUserLoggedIn.value){
    return authStore.isValidIdentityProvider;
  }
  else{
    return true;
  }
});
const userFilterConfig = computed(() => filterConfig("user"));
const filterTokens = computed(() => {
  return keys(filters.value).map((key) => {
    let config:
      | { name: string; label: string; short: string; type?: undefined }
      | { name: string; label: string; short: string; type: string }
      | { name: string; label: string; short?: undefined; type?: undefined }
      | null
      | undefined = null;
    userFilterConfig.value.sections.forEach((section) => {
      config = config || section.filters.find((filter) => filter.name === key);
    });
    return { ...(config || {}), key, value: filters.value[key] };
  });
});
const searchHistory = computed(() => ordersStore.searchHistory);

const pmOrder = computed(() => sendToPmStore.newOrder);
const savingPmOrder = computed(() => sendToPmStore.loading);
const showMultipleSelection = ref(false);

provide("options", options);

onBeforeMount(() => {
  ordersStore.initAdvancedFilters();
  changeDateFilter(dateFilter.value[0]);
  selectedStatus.value = statusList.value[0];
  
});
onMounted(()=>{
  const statusList:any = document.getElementById("statusListbox")?.getElementsByTagName("Ul")[0];
  if(statusList){
    statusList.style.display="flex";
    statusList.style["overflow-y"]="hidden";
    statusList.style.height="30px";
    statusList.style["align-items"]="center";
  }
});
function getDateFilter() {
  let threeMonthsDate = new Date();
  threeMonthsDate.setMonth(new Date().getMonth() - 3);
  let filter = [];
  filter.push({ label: "last 3 months", value: [threeMonthsDate, new Date()] });
  let sixMonthsFilter = new Date();
  sixMonthsFilter.setMonth(new Date().getMonth() - 6);
  filter.push({ label: "last 6 months", value: [sixMonthsFilter, new Date()] });
  for (let i = new Date().getFullYear(); i > 2019; i--) {
    filter.push({
      label: i.toString(),
      value: [new Date(i, 0, 1), new Date(i + 1, 0, 1)],
    });
  }
  return filter;
}
function changeDateFilter(dtFilter: any) {
  selectedDate.value = dtFilter.value;
  filters.value.startDate = dtFilter.value;
  ordersStore.setFilters(filters.value);
}
function searchByStatus(){
  filters.value.status = selectedStatus.value.value;
  ordersStore.setFilters(filters.value);
}
function search(filters: any) {
  if (filters) ordersStore.setFilters(filters);
  else {
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
  }
}

function getSearchHistory() {
  ordersStore.getSearchHistory(history);
}

const onPageChange = async (pageState: pagination.PageState) => {
  ordersStore.getOrders();
};

function createPmOrder() {
  sendToPmStore.initNewOrder();
  sendToPmStore.getPrinterLocations(authb2cStore.currentB2CUser.printerName);
}

function sendToPm(form: any) {
  sendToPmStore.sendToPm(form);
}

async function addToCart(order: any) {
  if (confirm("do you want to add more items from the dashboard?")) {
    order.selected = true;
    showMultipleSelection.value = true;
  } else {
    let orderToAdd = await ordersStore.getOrderById(order.sgsId);
    if (await ordersStore.addToCart(orderToAdd)) {
      alert("Order added to the cart successfully");
    }
  }
}
function reorder(order: any) {
  ordersStore.reorder(order);
}
function cancelOrder(order: any) {
  ordersStore.cancelOrder(order);
}

async function addMultipleToCart(values: any) {
  let ordersToAdd = ordersStore.orders.filter((x) => x.selected);
  for (let i = 0; i < ordersToAdd.length; i++) {
    let order = ordersToAdd[i];
    let orderToAdd = await ordersStore.getOrderById(order.sgsId);
    if (!(await ordersStore.addToCart(orderToAdd))) {
      alert("Error adding some orders to the cart");
      ordersToAdd.forEach((order) => {
        order.selected = false;
      });
      showMultipleSelection.value = false;
      return;
    }
    order.selected = false;
  }
  showMultipleSelection.value = false;
  alert("Orders added to the cart successfully");
}
</script>

<template lang="pug">
.page.dashboard(:class="{ 'dark':!isValidIdentityProvider }")
  sgs-scrollpanel(:scroll="false" v-if="isValidIdentityProvider")
    template(#header)
      app-header
    main
      welcome(:user="username")
      sgs-scrollpanel
        template(#header)
          header
            div.leftHeader
              h1 Recent Orders 
              prime-dropdown.sm.rangeFilter(v-model="selectedDate" name="datefilter" :options="dateFilter" appendTo="body"
                optionLabel="label" optionValue="value" @change="changeDateFilter")
            div
              prime-listbox.sm(id="statusListbox" v-model="selectedStatus" :options="statusList" optionLabel="name" @change="searchByStatus" )
            div.rightHeader
              orders-search(:config="userFilterConfig" :filters="filters" @search="search")
              template(v-if="userType === 'EXT'")
                send-pm(:order="pmOrder" :loading="savingPmOrder" @create="createPmOrder" @submit="sendToPm")
        orders-table(:config="config" :data="orders" :filters="filterTokens" @add="addToCart" @reorder="reorder" @cancel="cancelOrder"
        @addMultipleToCart="addMultipleToCart" :showMultipleSelection="showMultipleSelection" )
        //paginator(:rows="10" :totalRecords="useOrdersStore.totalNumberOfRecords" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange") 
    router-view
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.page.dashboard
  +container
  main
    +container
    padding: $s
    header
      +flex-fill
      h1
        flex: none
  &.dark
    background: var(--app-header-bg-color)
.rangeFilter
  left:40px
.leftHeader
    display: flex
    align-content: flex-start
    align-items: center
.rightHeader
    display: flex
    align-content: flex-end
    align-items: center
</style>
