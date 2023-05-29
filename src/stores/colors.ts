import colorsData from "@/data/mock/colors";
import { defineStore } from "pinia";

export const useColorsStore = defineStore("colorsStore", {
  state: () => ({
    colors: [],
  }),
  actions: {
    async getColors() {
      this.colors = colorsData;
    }
  },
});
