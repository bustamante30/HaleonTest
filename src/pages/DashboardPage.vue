<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import OrdersTable from "@/components/orders/OrdersTable.vue";
import OrdersSearch from "@/components/orders/OrdersSearch.vue";
import welcome from "../components/common/Welcome.vue";
import config from "@/data/config/orders-table";
import { keys } from "lodash";
import { filterConfig } from "@/data/config/order-filters";

import { useOrdersStore } from "@/stores/orders";
import { useAuthStore } from "@/stores/auth";

import Paginator from 'primevue/paginator';
import * as pagination from 'primevue/paginator';

const ordersStore = useOrdersStore();
const authStore = useAuthStore();

const username = computed(
  () =>
    `${authStore.currentUser.firstName || "John"} ${
      authStore.currentUser.lastName || "Doe"
    }`
);

const orders = computed(() => ordersStore.orders);
const filters = computed(() => ordersStore.filters);
const userFilterConfig = computed(() => filterConfig("user"));
const filterTokens = computed(() => {
  return keys(filters.value).map((key) => {
    let config: { name: string; label: string; short: string; type?: undefined; } | { name: string; label: string; short: string; type: string; } | { name: string; label: string; short?: undefined; type?: undefined; } | null | undefined = null;
    userFilterConfig.value.sections.forEach((section) => {
      config = config || section.filters.find((filter) => filter.name === key);
    });
    return { ...(config || {}), key, value: filters.value[key] };
  });
});

onBeforeMount(() => {
  ordersStore.initAdvancedFilters();
  ordersStore.getOrders();
});

    function search(filters: any) {
        if (filters)
            ordersStore.setFilters(filters);
        else { 
        ordersStore.initAdvancedFilters();
        ordersStore.getOrders();
    }
}

const onPageChange = async (pageState: pagination.PageState) => {
   ordersStore.getOrders(pageState);
}


function addToCart(order: any) {
  ordersStore.addToCart(order)
}
function reorder(order: any) {
  ordersStore.reorder(order)
}
function cancelOrder(order: any) {
  ordersStore.cancelOrder(order)
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
            orders-search(:config="userFilterConfig" :filters="filters" @search="search")
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
</style>
