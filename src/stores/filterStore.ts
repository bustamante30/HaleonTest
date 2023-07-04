import { createStore } from 'vuex';

const filterStore = createStore({
  state: {
    brandNameFilter: null,
    packTypeFilter: null,
    descriptionFilter: null,
    orderStatusFilter: null,
    sortFields: null,
    sortOrder: null
  },
  mutations: {
    setBrandNameFilter(state, value) {
      state.brandNameFilter = value;
    },
    setPackTypeFilter(state, value) {
      state.packTypeFilter = value;
    },
    setDescriptionFilter(state, value) {
      state.descriptionFilter = value;
    },
    setOrderStatusFilter(state, value) {
      state.orderStatusFilter = value;
    },
    setSortFields(state, value) {
      state.sortFields = value;
    },
    setSortOrder(state, value) {
      state.sortOrder = value;
    },
  },
});

export default filterStore;
