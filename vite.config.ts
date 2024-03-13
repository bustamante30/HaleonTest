import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import dsv from "@rollup/plugin-dsv";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue"],
      dts: "./src/auto-imports.d.ts",
    }),
    vue(),
    vueJsx(),
    dsv(),
  ],
  base: "/imagecarrierreorder/",
  server: {
    host: "localhost",
    port: 3000,
    cors: { origin: "*" },
    proxy: {
      "/api": {
        target: "https://localhost:3000/",
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      plugins: [terser()],
      output: {
        manualChunks(id: string | string[]) {
          if (id.includes("@azure/storage-blob")) {
            return "azure-storage-blob";
          }
          if (id.includes("pinia")) {
            return "pinia-chunk";
          }
          if (id.includes("@vueuse/core")) {
            return "vueuse-chunk";
          }
          if (id.includes("jwt-decode")) {
            return "jwt-decode";
          }
          if (id.includes("lodash")) {
            return "lodash";
          }
          if (id.includes("luxon")) {
            return "luxon";
          }
          if (id.includes("moment")) {
            return "moment";
          }
          if (id.includes("axios")) {
            return "axios";
          }
          if (id.includes("@heroicons/vue")) {
            return "heroicons-vue";
          }
          if (id.includes("primevue")) {
            return "primevue";
          }
          if (id.includes("vue-router")) {
            return "vue-router";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "@vueuse/core",
      "pinia",
      "axios",
      "jwt-decode",
      "lodash",
      "luxon",
    ],
  },
});
