import { defineConfig } from 'vite'
import path from 'node:path'
import { resolve } from 'path'
import { fileURLToPath } from 'node:url'
import htmlInclude from 'vite-plugin-html-include'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [htmlInclude()],
  server: {
    open: '/src/pages/index.html',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  build: {
    assetsInlineLimit: 0,
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        home: resolve(__dirname, 'src/pages/home.html'),
      },
    },
  },
})
