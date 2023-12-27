<!-- eslint-disable vue/attribute-hyphenation --><!-- eslint-disable vue/no-template-shadow -->
<template lang="pug">
data-table.p-datatable-sm.user-table(
:value="data" scrollable scrollHeight="flex" paginator :rows="30" :class="className"
    :currentPage="currentPage"
    :totalRecords="totalPages * 30" 
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    @page="onPageChange($event)")
  column(v-for="(col, i) in config.cols" :key=i :field="col.field" :header="col.header" :headerStyle="stylify(col.width)" :bodyStyle="stylify(col.width)" :frozen="col.freeze ? true : false" :alignFrozen="col.freeze")
    template(#body="{ data }")
      table-cell(:config="col" :data="data" )
  column(v-if="config.actions" :headerStyle="stylify(4)" :bodyStyle="stylify(4)" :frozen="true" alignFrozen="right")
    template(#body="{ data }")
      table-actions(:actions="config.actions(data)" :data="data" @action="handleAction")
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TableActions from "@/components/ui/TableActions.vue";
import TableCell from "@/components/ui/TableCell.vue";
import { ref, watch } from "vue";
import { useUsersStore } from "@/stores/users";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({ cols: [] }),
  },
  className: {
    type: [String, Array],
    default: null,
  },
  userType: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["editUser", "deleteUser", "resend"]);
const userStore = useUsersStore();
const currentPage = ref(1);

watch(currentPage, async (newPage, oldPage) => {
  if (newPage !== oldPage) {
    await fetchData(newPage);
  }
});

function stylify(width) {
  return width
    ? { width: `${width}rem`, flex: "none" }
    : { width: "auto", flex: "1" };
}

function handleAction(action) {
  if (action.event === "edit") {
    emit("editUser", { event: action.event, data: action.data });
  } else if (action.event === "deleteUser") {
    emit("deleteUser", { event: action.event, data: action.data });
  } else if (action.event === "resend") {
    emit("resend", { event: action.event, data: action.data });
  }
}

function onPageChange(event) {
  currentPage.value = event.page;
  // Fetch data based on the new page
  fetchData(event.page);
}

async function fetchData(newPage) {
  const printerId = userStore.selected.id;
  await userStore.assignPaginatedData(newPage, printerId, props.userType);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.user-table
  header
    +flex-fill
</style>
