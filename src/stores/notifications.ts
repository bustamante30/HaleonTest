import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notification: null as any,
    messages: [] as any[]
  }),
  actions: {
    addMessage(severity: string = 'info', summary: string = 'Summary', detail: string = 'Detailed message ...', life: number = 3000, position: string = 'bottom-left', group: string) {
      this.messages.push({ severity, summary, detail, life })
    },
    addNotification(summary: string, detail: string, options?: any) {
      options = { severity: 'warn', life: 3000, position: 'bottom-left', ...options }
      const notification = { summary: summary || 'Summary', detail: detail || 'Detailed message ...', ...options }
      this.notification = { ...notification }
    }
  }
})