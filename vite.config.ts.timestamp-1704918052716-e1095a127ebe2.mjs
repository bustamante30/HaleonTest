// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import vue from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import dsv from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/@rollup/plugin-dsv/dist/es/index.js";
import AutoImport from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/unplugin-auto-import/dist/vite.js";
import { defineConfig } from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/vite/dist/node/index.js";
import terser from "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/node_modules/@rollup/plugin-terser/dist/es/index.js";
var __vite_injected_original_import_meta_url =
  "file:///C:/Users/c-abalakrishnan/SGS/photon-imagecarrier-ui/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue"],
      dts: "./src/auto-imports.d.ts",
    }),
    vue(),
    vueJsx(),
    dsv(),
  ],
  server: {
    host: "localhost",
    port: 3e3,
    cors: { origin: "*" },
    proxy: {
      "/api": {
        target: "https://localhost:3000/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("./src", __vite_injected_original_import_meta_url),
      ),
    },
  },
  build: {
    rollupOptions: {
      plugins: [terser()],
      output: {
        manualChunks(id) {
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjLWFiYWxha3Jpc2huYW5cXFxcU0dTXFxcXHBob3Rvbi1pbWFnZWNhcnJpZXItdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGMtYWJhbGFrcmlzaG5hblxcXFxTR1NcXFxccGhvdG9uLWltYWdlY2Fycmllci11aVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYy1hYmFsYWtyaXNobmFuL1NHUy9waG90b24taW1hZ2VjYXJyaWVyLXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI7XHJcbmltcG9ydCBkc3YgZnJvbSBcIkByb2xsdXAvcGx1Z2luLWRzdlwiO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdGVyc2VyIGZyb20gXCJAcm9sbHVwL3BsdWdpbi10ZXJzZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFtcInZ1ZVwiXSxcclxuICAgICAgZHRzOiBcIi4vc3JjL2F1dG8taW1wb3J0cy5kLnRzXCIsXHJcbiAgICB9KSxcclxuICAgIHZ1ZSgpLFxyXG4gICAgdnVlSnN4KCksXHJcbiAgICBkc3YoKSxcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCJsb2NhbGhvc3RcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBjb3JzOiB7IG9yaWdpbjogXCIqXCIgfSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBcImh0dHBzOi8vbG9jYWxob3N0OjMwMDAvXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgXCJcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIHBsdWdpbnM6IFt0ZXJzZXIoKV0sXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rcyhpZDogc3RyaW5nIHwgc3RyaW5nW10pIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkBhenVyZS9zdG9yYWdlLWJsb2JcIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYXp1cmUtc3RvcmFnZS1ibG9iXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJwaW5pYVwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJwaW5pYS1jaHVua1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiQHZ1ZXVzZS9jb3JlXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInZ1ZXVzZS1jaHVua1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiand0LWRlY29kZVwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJqd3QtZGVjb2RlXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsb2Rhc2hcIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwibG9kYXNoXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJsdXhvblwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJsdXhvblwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibW9tZW50XCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIm1vbWVudFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiYXhpb3NcIikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYXhpb3NcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkBoZXJvaWNvbnMvdnVlXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImhlcm9pY29ucy12dWVcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInByaW1ldnVlXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInByaW1ldnVlXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJ2dWUtcm91dGVyXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInZ1ZS1yb3V0ZXJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICBcInZ1ZVwiLFxyXG4gICAgICBcInZ1ZS1yb3V0ZXJcIixcclxuICAgICAgXCJAdnVldXNlL2NvcmVcIixcclxuICAgICAgXCJwaW5pYVwiLFxyXG4gICAgICBcImF4aW9zXCIsXHJcbiAgICAgIFwiand0LWRlY29kZVwiLFxyXG4gICAgICBcImxvZGFzaFwiLFxyXG4gICAgICBcImx1eG9uXCIsXHJcbiAgICBdLFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFWLFNBQVMsZUFBZSxXQUFXO0FBQ3hYLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sWUFBWTtBQU5vTSxJQUFNLDJDQUEyQztBQVF4USxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxTQUFTLENBQUMsS0FBSztBQUFBLE1BQ2YsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsSUFBSTtBQUFBLEVBQ047QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU0sRUFBRSxRQUFRLElBQUk7QUFBQSxJQUNwQixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixTQUFTLENBQUMsU0FBaUIsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixTQUFTLENBQUMsT0FBTyxDQUFDO0FBQUEsTUFDbEIsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUF1QjtBQUNsQyxjQUFJLEdBQUcsU0FBUyxxQkFBcUIsR0FBRztBQUN0QyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDeEIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLFlBQVksR0FBRztBQUM3QixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxRQUFRLEdBQUc7QUFDekIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsT0FBTyxHQUFHO0FBQ3hCLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLFFBQVEsR0FBRztBQUN6QixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDeEIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsZ0JBQWdCLEdBQUc7QUFDakMsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsVUFBVSxHQUFHO0FBQzNCLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLFlBQVksR0FBRztBQUM3QixtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
