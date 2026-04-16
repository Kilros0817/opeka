import { defineConfig } from 'vite'
import path from 'node:path'
import { resolve } from 'path'
import { fileURLToPath } from 'node:url'
import posthtml from '@malobre/vite-plugin-posthtml'
import { componentFolders, htmlSrcAssets, sgSnippetPlugin, statelessPosthtmlComponent, webTypesWatcher } from './scripts/vite-plugins.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  base: './',
  publicDir: false,
  plugins: [
    webTypesWatcher(),
    posthtml({
      plugins: [
        statelessPosthtmlComponent({
          root: './src',
          tag: 'component',
          attribute: 'src',
          tagPrefix: 'x-',
          slotSeparator: '-',
          folders: componentFolders(__dirname),
          plugins: { before: [sgSnippetPlugin()], after: [] },
        }),
      ],
    }),
    htmlSrcAssets(__dirname),
  ],
  server: {
    open: '/src/pages/styleguide/index.html',
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
    manifest: true, // для Bitrix-интеграции
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/scripts/main.js'),
        home: resolve(__dirname, 'src/pages/home/home.html'),
        'styleguide-index': resolve(__dirname, 'src/pages/styleguide/index.html'),
        'styleguide-tokens': resolve(__dirname, 'src/pages/styleguide/tokens.html'),
        'styleguide-animations': resolve(__dirname, 'src/pages/styleguide/animations.html'),
        'styleguide-components': resolve(__dirname, 'src/pages/styleguide/components.html'),
        'styleguide-sections': resolve(__dirname, 'src/pages/styleguide/sections.html'),

        // Legacy

        // 'legacy-home': resolve(__dirname, 'legacy/pages/home.html'),
      },
    },
  },
})
