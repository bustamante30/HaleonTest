import { FaqService } from '@/services/FaqService'
import { defineStore } from 'pinia'
export const useFaqStore = defineStore('faq-store', {
  state: () => ({
    faqs: {
        results:[]
    } as any
  }),
  actions: {
    setFaqs(faqs: any) {
      this.faqs = faqs
    },
    async loadFaqs() {
      // If FAQs not present in store then fetch the FAQ from server
      if (this.faqs.results?.length === 0) {
        const faq: any = await FaqService.getFaq()
        this.setFaqs(faq)
      }

      return this.faqs
    }
  }
})
