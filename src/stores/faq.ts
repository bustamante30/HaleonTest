import { FaqService } from "@/services/FaqService";
import { defineStore } from "pinia";
export const useFaqStore = defineStore("faq-store", {
  state: () => ({
    faqs: {
      results: [],
    },
  }),
  actions: {
    setFaqs(faqs) {
      this.faqs = faqs;
    },
    async loadFaqs() {
      // If FAQs not present in store then fetch the FAQ from server
      if (this.faqs.results?.length === 0) {
        const faq = await FaqService.getFaq();
        this.setFaqs(faq);
      }

      return this.faqs;
    },
  },
});
