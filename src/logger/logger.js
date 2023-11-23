/* eslint-disable no-console */
import { useLoggerStore } from "@/stores/uilogger";
import { useAuthStore } from "@/stores/auth";

export class Logger {
  constructor(component) {
    this.component = component;
  }

  debug(...msg) {
    try {
      const loggerStore = useLoggerStore();
      const authStore = useAuthStore();
      const logmesage = `${loggerStore.uuid} - [${
        this.component
      }] -ImageCarrier- ${authStore.currentUser.username} - ${msg.join(" - ")}`;
      console.log(logmesage);
    } catch {
      console.error("Loggin debug Error");
    }
  }

  log(...msg) {
    try {
      const loggerStore = useLoggerStore();
      const authStore = useAuthStore();
      const logmesage = `${loggerStore.uuid} - [${
        this.component
      }] -ImageCarrier- ${authStore.currentUser.username} - ${msg.join(" - ")}`;
      console.log(logmesage);
      loggerStore.logger.trackTrace({ message: logmesage });
    } catch {
      console.error("Loggin Error");
    }
  }

  warn(...msg) {
    try {
      const loggerStore = useLoggerStore();
      const authStore = useAuthStore();
      const logmesage = `${loggerStore.uuid} - [${
        this.component
      }] -ImageCarrier- ${authStore.currentUser.username} - ${msg.join(" - ")}`;
      console.warn(logmesage);
    } catch {
      console.error("Loggin warn Error");
    }
  }

  trackEvent(name, properties) {
    const loggerStore = useLoggerStore();
    loggerStore.logger.trackEvent({ name, properties });
    console.log({ name, properties });
  }

  error(...msg) {
    try {
      const loggerStore = useLoggerStore();
      const authStore = useAuthStore();
      const logmesage = `${loggerStore.uuid} - [${
        this.component
      }] -ImageCarrier- ${authStore.currentUser.username} - ${msg.join(" - ")}`;
      console.error(logmesage);
      loggerStore.logger.trackTrace({ exception: logmesage });
      loggerStore.logger.trackException({ exception: new Error(logmesage) });
    } catch (exception) {
      console.error("Loggin Error");
    }
  }
}
