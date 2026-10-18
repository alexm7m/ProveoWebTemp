import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo el proxy evita problemas de CORS: /api -> backend en el puerto 3000.
// En produccion se puede sobreescribir con VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
