<template lang="pug">
span.table-action(v-if="actions.length>0")
  sgs-button#table-actions.sm.default(icon="unfold_more" @click="toggleMenu")
  prime-menu(ref="menu" :model="items" popup)
    template(#item="{ item }")
      span.menu-item
        span.material-icons {{ item.icon }}
        span {{ item.label }}
</template>

<script setup>
import { ref, computed } from "vue";
import { DateTime } from "luxon";

const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Object,
    default: null,
  },
});

const menu = ref();
const emit = defineEmits(["select", "action"]);

const items = computed(() => {
  return props.actions.map((action) => {
    return {
      label: action.label,
      icon: action.icon,
      validate: action.validate,
      field: action.field,
      command: () => {
        emit("action", { event: action.event, data: props.data });
      },
    };
  });
});

async function toggleMenu(event) {
  const removeIndex = items.value.findIndex((x) => x.validate);
  if (removeIndex >= 0) {
    const item = items.value[removeIndex];
    const submittedDate = props.data[item.field];
    const currentTime = DateTime.fromJSDate(new Date());
    const subTime = DateTime.fromMillis(new Date(submittedDate).getTime());
    const diff = currentTime.diff(subTime, ["minutes"]).minutes;
    if (diff > 10) {
      items.value.splice(removeIndex, 1);
      if (items.value.length > 0) menu.value.toggle(event);
    } else {
      menu.value.toggle(event);
    }
  } else {
    menu.value.toggle(event);
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

span.menu-item
  +flex
  cursor: pointer
  padding: $s50 $s
  span.material-icons
    font-size: 20px
    padding: 0 $s50
</style>
