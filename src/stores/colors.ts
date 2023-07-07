// import colorsData from "@/data/mock/colors";
import type { ColourDto } from "@/models/ColourDto";
import { defineStore } from "pinia";
import { useOrdersStore } from "./orders";

export const useColorsStore = defineStore("colorsStore", {
  state: () => ({
    colors: [] as ColourDto[], // Specify the type of colors
  }),
  actions: {
    async getColors() {
      const ordersStore = useOrdersStore()
      this.colors = colorsData;
    }
  },
});
