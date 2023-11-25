/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineStore } from "pinia";
import * as Constants from "../services/Constants";

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notification: null as any,
    messages: [] as any[],
  }),
  actions: {
    addMessage(
      severity = "info",
      summary = "Summary",
      detail = "Detailed message ...",
      life = 3000,
      position = "bottom-left",
      group: string,
    ) {
      this.messages.push({ severity, summary, detail, life, position, group });
    },
    addNotification(summary: string, detail: string, options?: any) {
      if (detail !== Constants.REQUEST_CANCEL) {
        options = {
          severity: "warn",
          life: 3000,
          position: "top-right",
          ...options,
        };
        const notification = {
          summary: summary || "Summary",
          detail: detail || "Detailed message ...",
          ...options,
        };
        this.notification = { ...notification };
        if (options.life) {
          setTimeout(() => {
            this.notification = null;
          }, options.life);
        }
      }
    },
    removeNotification() {
      setTimeout(() => {
        this.notification = null;
      }, 1000);
    },
  },
});
