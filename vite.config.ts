import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    process.env.ANALYZE_BUNDLE === 'true' && visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
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
    // Keep route styles in the entry stylesheet. Hostinger deployments can
    // briefly serve index.html and hashed chunks from different generations;
    // route-level CSS preloads then fail and prevent lazy routes from loading.
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild
          ? undefined
          : {
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-pdf-core': ['pdf-lib', 'pdfjs-dist'],
              'vendor-pdf-renderer': ['@react-pdf/renderer'],
              'vendor-docx': ['docx'],
              'vendor-doc-import': ['mammoth'],
              'vendor-image': ['@jsquash/avif', '@jsquash/webp', 'html-to-image'],
              'vendor-docs': ['marked', 'dompurify'],
              'vendor-ocr': ['tesseract.js'],
            },
      },
    },
  },
}))
