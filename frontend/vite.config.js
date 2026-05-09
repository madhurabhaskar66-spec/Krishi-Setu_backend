import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-main': { target: 'http://127.0.0.1:8080', changeOrigin: true, rewrite: path => path.replace(/^\/api-main/, '') },
      '/api-app': { target: 'http://127.0.0.1:5000', changeOrigin: true, rewrite: path => path.replace(/^\/api-app/, '') },
      '/api-price': { target: 'http://127.0.0.1:8001', changeOrigin: true, rewrite: path => path.replace(/^\/api-price/, '') },
      '/api-chat': { target: 'http://127.0.0.1:8002', changeOrigin: true, rewrite: path => path.replace(/^\/api-chat/, '') },
      '/api-call': { target: 'http://127.0.0.1:8003', changeOrigin: true, rewrite: path => path.replace(/^\/api-call/, '') },
      '/api-verify': { target: 'http://127.0.0.1:8004', changeOrigin: true, rewrite: path => path.replace(/^\/api-verify/, '') }
    }
  }
})
