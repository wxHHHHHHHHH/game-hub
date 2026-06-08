import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000, proxy: { '/api': 'http://localhost:27890', '/uploads': 'http://localhost:27890' } },
  build: { outDir: 'dist', assetsDir: 'assets' }
})
