import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Grade-band type bump (her note, 2026-10-02: 2nd & 3rd grade get every font
// 2pt bigger): every px font-size in the CSS becomes calc(size + var(--fs-up)).
// theme.css sets --fs-up to 2pt for data-band="2-3". Inline styles get the same
// treatment in src/lib/lit-icons/core.js.
const fsUp = {
  postcssPlugin: 'fs-up',
  Declaration(decl) {
    if (decl.prop !== 'font-size' || !/\dpx/.test(decl.value) || decl.value.includes('--fs-up')) return
    decl.value = `calc(${decl.value} + var(--fs-up, 0px))`
  },
}

export default defineConfig({
  css: { postcss: { plugins: [fsUp] } },
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
