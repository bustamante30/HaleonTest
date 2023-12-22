import { defineStore } from "pinia";
import {
  WebPubSubClient,
  type OnConnectedArgs,
  type OnDisconnectedArgs,
  type OnServerDataMessageArgs,
} from "@azure/web-pubsub-client";
import { Logger } from "@/logger/logger";
import { useOrdersStore } from "./orders";

const logger = new Logger("stores-webpubsub");

export const useWebPubSubStore = defineStore("webpubsub", {
  state: () => ({
    isConnected: false,
    connection: {} as WebPubSubClient | null,
  }),
  actions: {
    connect(token: string) {
      try {
        if (!this.isConnected) {
          this.connection = new WebPubSubClient(token);
          this.connection.start();
          this.connection.on("connected", (e: OnConnectedArgs) => {
            console.log("connected", e);
            this.isConnected = true;
          });

          this.connection.on("disconnected", (e: OnDisconnectedArgs) => {
            console.log("disconnected", e);
            this.isConnected = false;
          });

          this.connection.on("server-message", (e: OnServerDataMessageArgs) => {
            if (e && e.message.data) {
              console.log(`Received message ${e.message.data}`);
              const orderStore = useOrdersStore();
              orderStore.updateOrder(e.message.data);
            }
          });
        }
      } catch (error) {
        logger.error("connect - exception - " + error);
      }
    },
    disconnect() {
      if (this.isConnected) {
        this.connection?.stop();
        this.isConnected = false;
      }
    },
  },
});
