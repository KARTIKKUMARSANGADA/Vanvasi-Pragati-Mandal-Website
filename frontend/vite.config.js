import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const library = id.toString().split('node_modules/')[1].split('/')[0].toString();
            if (['react', 'react-dom', 'react-router-dom', '@remix-run', 'react-router'].includes(library)) {
              return 'vendor-core';
            }
            if (['framer-motion', 'recharts', 'leaflet', '@supabase', 'react-leaflet'].includes(library)) {
              return 'vendor-ui-libs';
            }
            return 'vendor-helpers';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
