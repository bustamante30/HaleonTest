
import { defineStore } from 'pinia'
import { useNotificationsStore } from './notifications'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const useSendToPmStore = defineStore('sendToPmStore', {
  state: () => ({
    showForm: false,
    newOrder: null as any,
    loading: false
  }),
  getters: {
  },
  actions: {
    initNewOrder() {
      this.newOrder = {
        brand: null,
        description: null,
        packType: null,
        purchaseOrder: null,
        itemCode: null,
        plateId: null,
        carrierCode: {
          type: 'UPC',
          code: null,
        },
        jobNumber: null,
        comments: null,
        location: null
      }
    },
    async sendToPm(form : any) {
      this.loading = true
      await timeout(2000)
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification(`Order Sent`, 'Your order is successfully sent to a project manager', { severity: 'success' })
      this.newOrder = null
      this.loading = false
    }
  }
})