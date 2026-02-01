import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'personal-dashboard.test',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://api.personal-dashboard.test',
        changeOrigin: true,
      }
    }
  }
})