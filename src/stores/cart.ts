import { defineStore } from "pinia";
import ReorderService from "@/services/ReorderService";

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    cartOrders: [] as any[],
    cartCount: 0,

  }),
  getters: {
  },
  actions: {
    async getCartCount() {
      this.cartCount = await ReorderService.getCartCount();
      console.log(this.cartCount);
    },
    async getCart() {
      this.cartOrders = await ReorderService.getCart();
      this.decorateCartOrders();
      console.log(this.cartOrders);
    },    
    decorateCartOrders() {
      for (let i = 0; i < this.cartOrders.length; i++) {
        if (!this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = new URL(
            "@/assets/images/no_thumbnail.png",
            import.meta.url
          );
        } else if (this.cartOrders[i].thumbNailPath) {
          this.cartOrders[i].thumbNailPath = decodeURIComponent(
            this.cartOrders[i].thumbNailPath
          );
        }
        ReorderService.decorateColours(this.cartOrders[i].colors);
      }
    },
    async addToCart(order: any) {
      if (await ReorderService.submitReorder(order, 1)) {
        this.cartCount = this.cartCount + 1;
        return true;
      } else {
        alert(" Error adding order to cart");
        return false;
      }
    },  
    async discardOrder(id: string) {
      console.log("order to be discarded" + id);
      return await ReorderService.discardOrder(id);
    },      
  }
})