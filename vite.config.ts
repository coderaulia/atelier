import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@jsquash/avif', '@jsquash/webp'],
  },
  worker: {
    format: 'es',
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          'vendor-cv': ['@react-pdf/renderer'],
          'vendor-image': ['@jsquash/avif', '@jsquash/webp', 'html-to-image'],
          'vendor-docs': ['marked', 'dompurify'],
          'vendor-ocr': ['tesseract.js'],
          'vendor-archive': ['jszip'],
        },
      },
    },
  },
})
