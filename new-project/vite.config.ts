import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api/geocoding": {
        target: "https://geocoding-api.open-meteo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocoding/, "/v1/search"),
      },
      "/api/forecast": {
        target: "https://api.open-meteo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/forecast/, "/v1/forecast"),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
