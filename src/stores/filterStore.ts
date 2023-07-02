import { createStore } from 'vuex';

const filterStore = createStore({
  state: {
    brandNameFilter: null,
    packTypeFilter: null,
    orderStartDateFilter: null,
    orderEndDateFilter: null,
    sortFields: null,
  },
  mutations: {
    setBrandNameFilter(state, value) {
      state.brandNameFilter = value;
    },
    setPackTypeFilter(state, value) {
      state.packTypeFilter = value;
    },
    setOrderStartDateFilter(state, value) {
      state.orderStartDateFilter = value;
    },
    setOrderEndDateFilter(state, value) {
      state.orderEndDateFilter = value;
    },
    setSortFields(state, value) {
      state.sortFields = value;
    },
  },
});

export default filterStore;
