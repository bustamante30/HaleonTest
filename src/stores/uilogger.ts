import { defineStore } from "pinia";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { v4 as uuidv4 } from "uuid";
export const useLoggerStore = defineStore("uilogger", {
  state: () => ({
    logger: {},
    uuid: {},
  }),

  actions: {
    async init() {
      const appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: import.meta.env
            .VITE_APPINSIGHTS_INSTRUMENTATIONKEY,
        },
      });
      appInsights.loadAppInsights();
      appInsights.trackPageView();
      this.logger = appInsights;
      const sessionId = sessionStorage.getItem("uid");
      if (sessionId == null) {
        const id = uuidv4();
        this.uuid = id;
        sessionStorage.setItem("uid", id);
      } else {
        this.uuid = sessionId;
      }
    },
  },
});
