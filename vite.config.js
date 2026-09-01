import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // html2pdf 全家桶按需加载，独立 chunk 较大属正常，放宽阈值避免噪音
    chunkSizeWarningLimit: 1500,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
