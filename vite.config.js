import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'rating-university-web-v2-1.onrender.com', // домен фронтенда
      'rating-university-2-0.onrender.com'       // домен бэкенда
    ],
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
  }
})
