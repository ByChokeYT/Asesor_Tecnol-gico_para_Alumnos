import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Ya no eliminamos el prefijo /api, para que el backend lo reciba completo
        rewrite: (path) => path
      },
    },
  },
})
