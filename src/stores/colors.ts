import colorsData from "@/data/mock/colors";
import { defineStore } from "pinia";

export const useColorsStore = defineStore("colorsStore", {
  state: () => ({
    // colors: [],
    colors: [] as { colour: string; imageId: string; sets: number }[], // Specify the type of colors
  }),
  actions: {
    async getColors() {
      this.colors = colorsData;
    }
  },
});
