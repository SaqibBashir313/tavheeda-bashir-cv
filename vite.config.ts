import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vendor chunking keeps the initial payload small and cache-stable:
 * animation/carousel libraries only ship on routes that actually use them.
 */
function vendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('gsap')) return 'vendor-gsap';
  if (id.includes('swiper')) return 'vendor-swiper';
  if (id.includes('@radix-ui')) return 'vendor-radix';
  if (id.includes('react-router')) return 'vendor-router';
  if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
    return 'vendor-react';
  }
  return 'vendor';
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
});
