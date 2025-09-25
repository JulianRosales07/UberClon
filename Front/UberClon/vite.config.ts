import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true,
    allowedHosts: ['qimfxk-ip-191-156-5-191.tunnelmole.net']
  },
  preview: {
    port: 3000,
    host: true
  }
})
