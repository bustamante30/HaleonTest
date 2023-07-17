<script setup lang="ts">
import { computed, onBeforeMount, provide } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import OrdersTable from "@/components/orders/OrdersTable.vue";
import OrdersSearch from "@/components/orders/OrdersSearch.vue";
import welcome from "../components/common/Welcome.vue";
import config from "@/data/config/orders-table";
import { keys } from "lodash";
import { filterConfig } from "@/data/config/order-filters";

import { useOrdersStore } from "@/stores/orders";
import { useAuthStore } from "@/stores/auth";

import Paginator from "primevue/paginator";
import * as pagination from "primevue/paginator";
import { useSendToPmStore } from "@/stores/send-to-pm";
import SendPm from '@/components/orders/SendToPm.vue'

const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const sendToPmStore = useSendToPmStore();

const username = computed(
  () =>
    `${authStore.currentUser.firstName || "John"} ${
      authStore.currentUser.lastName || "Doe"
    }`
);
const dateFilter = computed(() => getDateFilter());
const orders = computed(() => ordersStore.orders);
const options = computed(() => ordersStore.options);
const filters = computed(() => ordersStore.filters);
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

provide("options", options);

onBeforeMount(() => {
  ordersStore.initAdvancedFilters();
  changeDateFilter(dateFilter.value[0])
});

function getDateFilter() {
    let filter = [
        { label: "last 3 months", value: 0 },
        { label: "last 6 months", value: 1 }
    ];
    for (let i = new Date().getFullYear(); i > 2019; i--) {
        filter.push({ label: i.toString(), value: i })
    }
    return filter
}
function changeDateFilter(dtFilter: any) {
    let startDate = new Date();
    debugger
    switch (dtFilter.value) {
        case 0:
            startDate.setMonth(new Date().getMonth() - 3)
            filters.value.startDate = [startDate, new Date()]
            break;
        case 1:
            startDate.setMonth(new Date().getMonth() - 6)
            filters.value.startDate = [startDate, new Date()]
            break;
        default:
            startDate = new Date(dtFilter.value,1,1)
            filters.value.startDate = [startDate, new Date()]
            break;
    }
    ordersStore.setFilters(filters.value)
}
function search(filters: any) {
  if (filters) ordersStore.setFilters(filters);
  else {
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
  }
}

function getSearchHistory() {
  ordersStore.getSearchHistory(history)
}

const onPageChange = async (pageState: pagination.PageState) => {
  ordersStore.getOrders(pageState);
};

function createPmOrder() {
  sendToPmStore.initNewOrder()
}

function sendToPm(form: any) {
  sendToPmStore.sendToPm(form)
}

function addToCart(order: any) {
  ordersStore.addToCart(order);
}
function reorder(order: any) {
  ordersStore.reorder(order);
}
function cancelOrder(order: any) {
  ordersStore.cancelOrder(order);
}
</script>

<template lang="pug">
.page.dashboard
  sgs-scrollpanel(:scroll="false")
    template(#header)
      app-header
    main
      welcome(:user="username")
      sgs-scrollpanel
        template(#header)
          header
            h1 Recent Orders 
            prime-dropdown.sm.rangeFilter(v-model="dateFilter" name="datefilter" :options="dateFilter" appendTo="body"
                optionLabel="label" optionValue="value" @change="changeDateFilter")
            orders-search(:config="userFilterConfig" :filters="filters" @search="search")
            send-pm(:order="pmOrder" :loading="savingPmOrder" @create="createPmOrder" @submit="sendToPm")
        orders-table(:config="config" :data="orders" :filters="filterTokens" @add="addToCart" @reorder="reorder" @cancel="cancelOrder")
        paginator(:rows="useOrdersStore.pageSize ?? 10" :totalRecords="useOrdersStore.totalNumberOfRecords" :rowsPerPageOptions="[5, 10, 20]" @page="onPageChange") 
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
        flex: 1
.rangeFilter
  width:150px   
</style>
