import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  base: process.env.VITE_BASE || (process.env.VITE_STATIC === '1' ? '/lonestar-writing-studio-v1/' : '/'),
  // every element goes through src/lib/lit-icons, which draws the platform's emoji
  // as her painted enchanted-forest icons (2026-10-01)
  plugins: [react({ jsxImportSource: 'lit-icons' })],
  resolve: { alias: { 'lit-icons': fileURLToPath(new URL('./src/lib/lit-icons', import.meta.url)) } },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
