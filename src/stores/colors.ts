import type { ColourDto } from "@/models/ColourDto";
import { defineStore } from "pinia";
import { useOrdersStore } from "./orders";
import { computed } from "vue";

export const useColorsStore = defineStore("colorsStore", {
  state: () => ({
    colors: [] as ColourDto[], // Specify the type of colors
  }),
  actions: {
    async getColors() {
      const ordersStore = useOrdersStore();
      const colorsData = computed(() => ordersStore.selectedOrder.colors);
      this.colors = colorsData.value.map((color) => ({
        ...color,
        sets: 0,
      }));
    },
  },
});
