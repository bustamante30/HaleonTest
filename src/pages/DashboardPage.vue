<script setup lang="ts">
import { computed, watch, provide, ref, onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import OrdersTable from "@/components/orders/OrdersTable.vue";
import OrdersSearch from "@/components/orders/OrdersSearch.vue";
import welcome from "../components/common/Welcome.vue";
import config from "@/data/config/orders-table";
import { filter, keys } from "lodash";
import { filterConfig } from "@/data/config/order-filters";

import { useOrdersStore } from "@/stores/orders";
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useSendToPmStore } from "@/stores/send-to-pm";
import SendPm from "@/components/orders/SendToPm.vue";
import { useConfirm } from "primevue/useconfirm";
import { useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()
const confirm = useConfirm();
const ordersStore = useOrdersStore();
const cartStore = useCartStore()
const authStore = useAuthStore();
const sendToPmStore = useSendToPmStore();
const authb2cStore = useB2CAuthStore();

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
    }`
);

const dateFilter = computed(() => getDateFilter());
const selectedDate = ref(() => dateFilter.value[0]);
const statusList = computed(() =>ordersStore.statusList);
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
const loadingOrders = computed(() => ordersStore.loadingOrders)
const searchHistory = computed(() => ordersStore.searchHistory);

const pmOrder = computed(() => sendToPmStore.newOrder);
const savingPmOrder = computed(() => sendToPmStore.loading);
const showMultipleSelection = ref(false);
const searchExecuted = ref(false);
// Freetext tags 
const searchTags =ref([])

provide("options", options);
watch(currentUser, (value) => {
  if (authStore.currentUser && !ordersStore.firstLoad) {
    ordersStore.firstLoad = true;
    ordersStore.initAdvancedFilters();
    selectedStatus.value = statusList.value[0];
    changeDateFilter(dateFilter.value[0]);
  }
});
watch(currentB2CUser, (value) => {
  if (authb2cStore.currentB2CUser && !ordersStore.firstLoad) {
    ordersStore.firstLoad = true;
    ordersStore.initAdvancedFilters();
    selectedStatus.value = statusList.value[0];
    changeDateFilter(dateFilter.value[0]);
  }
});

function getDateFilter() {
  let threeMonthsDate = new Date();
  threeMonthsDate.setMonth(new Date().getMonth() - 3);
  let filter = [];
  filter.push({ label: "last 3 months", value: "last 3 months" });
  let sixMonthsFilter = new Date();
  sixMonthsFilter.setMonth(new Date().getMonth() - 6);
  filter.push({ label: "last 6 months", value: "last 3 months" });
  for (let i = new Date().getFullYear(); i > 2019; i--) {
    filter.push({
      label: i.toString(),
      value: i.toString(),
    });
  }
  return filter;
}
function getDateRange(filter: string) {
  switch(filter)
  {
    case "last 3 months":
      let threeMonthsDate = new Date();
      threeMonthsDate.setMonth(new Date().getMonth() - 3); 
      return [threeMonthsDate, new Date()] 
    case "last 6 months":
      let sixMonthsFilter = new Date();
      sixMonthsFilter.setMonth(new Date().getMonth() - 6);
      return [sixMonthsFilter, new Date()] 
    default:
      let i = parseInt(filter)
      return [new Date(i, 0, 1), new Date(i + 1, 0, 1)]
  }
}
function changeDateFilter(dtFilter: any) {
  
  selectedDate.value = dtFilter.value;
  filters.value.startDate = getDateRange(dtFilter.value);
  filters.value.status = selectedStatus.value.value;
  addPrinterFilter()
  ordersStore.setFilters(filters.value);
}
function addPrinterFilter(){
  console.log('printer: '+authb2cStore.currentB2CUser.printerName)
  const printerName = authb2cStore.currentB2CUser.isLoggedIn? authb2cStore.currentB2CUser.printerName: null
  if(printerName && !filters.value.printerName)
    filters.value.printerName = printerName 
}
function searchByStatus(){
  ordersStore.resetFilters()
  filters.value.startDate = getDateRange(selectedDate.value.toString());
  filters.value.status = selectedStatus.value.value;
  addPrinterFilter()
  ordersStore.setFilters(filters.value);
}
function searchKeyword(event: any) {
 
  if (event) {
    searchExecuted.value = true
    searchTags.value = event.query.split(',')
    const fil = {
      ...filters.value,
      query:event.query
    }
    addPrinterFilter()
    ordersStore.setFilters(fil);
  }
  else {
    searchTags.value = []
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
    searchExecuted.value = false
  }
}
function search(filters: any) {
  searchExecuted.value = true
  ordersStore.pageState.page = 1
  searchTags.value = []
  filters.query =  ''
  if (filters) {
    if(filters.status!==selectedStatus.value.value)
    {
      selectedStatus.value = statusList.value.find((x)=>x.value === filters.status)
    }
    addPrinterFilter()
    ordersStore.setFilters(filters);
  }
  else {
    ordersStore.initAdvancedFilters();
    ordersStore.getOrders();
  }
}

const clearSearchTags = (index: number) =>{
  searchTags.value.splice(index,1)
  if(searchTags.value.length === 0)
    searchExecuted.value = false;
  const fil = {
    ...filters.value,
    query:searchTags.value.join(',')
  }
  addPrinterFilter()
  ordersStore.setFilters(fil);

}

const clearAllSearchTags = () =>{
  searchTags.value = []
  const fil = {
      ...filters.value,
      query:searchTags.value.join(',')
    }
    addPrinterFilter()
    ordersStore.setFilters(fil);
    searchExecuted.value = false;
}

function getSearchHistory() {
  ordersStore.getSearchHistory(history);
}

function createPmOrder() {
  sendToPmStore.initNewOrder();
  sendToPmStore.getPrinterLocations(authb2cStore.currentB2CUser.printerName);
  sendToPmStore.getCodeTypes()
}

function sendToPm(form: any) {
  sendToPmStore.sendToPm(form);
}

async function addToCart(order: any) {
  confirm.require({
    message: "Do you want to add more orders to the cart?",
    header: "Add more Orders",
    icon: 'pi pi-info-circle',
    accept: async () => {
      order.selected = true;
      showMultipleSelection.value = true;
      (document.getElementsByClassName("p-image-preview-indicator")[0]as HTMLElement)?.focus();
    },
    reject: async () => {
      ordersStore.loadingOrders=true;
      let orderToAdd = await ordersStore.getOrderById(order.sgsId);
      if (await cartStore.addToCart(orderToAdd)) {
        notificationsStore.addNotification(`Success`, 'Order added to the cart successfully', { severity: 'success' })
      }
      ordersStore.loadingOrders=false;
    },
  });
}
function reorder(order: any) {
  ordersStore.reorder(order);
}
function cancelOrder(order: any) {
  ordersStore.cancelOrder(order);
}

async function addMultipleToCart(values: any) {
  ordersStore.loadingOrders=true;
  let ordersToAdd = ordersStore.orders.filter((x) => x.selected);
  for (let i = 0; i < ordersToAdd.length; i++) {
    let order = ordersToAdd[i];
    let orderToAdd = await ordersStore.getOrderById(order.sgsId);
    if (!(await cartStore.addToCart(orderToAdd))) {
      notificationsStore.addNotification(`Error`, 'Error adding some orders to the cart', { severity: 'error' })
      ordersToAdd.forEach((order) => {
        order.selected = false;
      });
      showMultipleSelection.value = false;
      return;
    }
    order.selected = false;
  }
  showMultipleSelection.value = false;
  if(ordersToAdd.length>0)
  {
    notificationsStore.addNotification(`Success`, ordersToAdd.length+' Orders added to the cart successfully', { severity: 'success' });
  }
  ordersStore.loadingOrders=false;
}
</script>

<template lang="pug">
.page.dashboard(:class="{ 'dark':!isValidIdentityProvider }")
  sgs-scrollpanel(:scroll="false" v-if="isValidIdentityProvider")
    template(#header)
      app-header
    main
      sgs-scrollpanel(:scroll="false")
        template(#header)
          welcome(:user="username")
          header
            div.leftHeader(v-if="searchExecuted")
              h1 Search Results 
            div.leftHeader(v-if="!searchExecuted")
              h1 Recent Orders 
              prime-dropdown.sm.rangeFilter(v-model="selectedDate" name="datefilter" :options="dateFilter" appendTo="body"
                optionLabel="label" optionValue="value" @change="changeDateFilter")
            div(v-if="!searchExecuted")
              prime-listbox.sm(id="statusListbox" v-model="selectedStatus" :options="statusList" optionLabel="name" @change="searchByStatus" )
            div.rightHeader
              orders-search(:config="userFilterConfig" :filters="filters" @search="search" @searchkeyword="searchKeyword")
              template(v-if="userType === 'EXT'")
                send-pm(:order="pmOrder" :loading="savingPmOrder" @create="createPmOrder" @submit="sendToPm")
          .search-tag
            .tag(v-for="(tag ,index) in searchTags" :key="tag")
              span {{tag}}
              span.pi.pi-times.icon(@click="clearSearchTags(index)") 
            .tag(v-if="searchTags.length > 0")
              span Clear All
              span.pi.pi-times.icon(@click="clearAllSearchTags") 
        orders-table(:config="config" :data="orders" :userType="userType" @add="addToCart" @reorder="reorder" @cancel="cancelOrder"
        @addMultipleToCart="addMultipleToCart" :showMultipleSelection="showMultipleSelection" :loading="loadingOrders" :status="selectedStatus" )
      prime-confirm-dialog
        template(#message="slotProps")
          div.dialogLayout
            i(:class="slotProps.message.icon" style="font-size: 1.5rem;margin-right:0.5rem;")
            p(:class="pl-2") {{ slotProps.message.message }}
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
</style>
