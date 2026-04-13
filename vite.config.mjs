import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = __dirname
const pagesRoot = path.join(projectRoot, 'src', 'pages')

function expandIncludes(root, html, stack = new Set()) {
  return html.replace(/<!--\s*@opeka-include\s+([^>]+?)\s*-->/g, (_, rel) => {
    const abs = path.resolve(root, rel.trim())
    if (stack.has(abs)) throw new Error(`[opeka-layout] Circular include: ${rel}`)
    stack.add(abs)
    return expandIncludes(root, fs.readFileSync(abs, 'utf8'), stack)
  })
}

function opekaIncludesPlugin() {
  const root = projectRoot
  const watchRoot = path.join(root, 'src')
  const headerInclude = '<!-- @opeka-include src/sections/site-header/site-header.html -->'
  const footerInclude = '<!-- @opeka-include src/sections/site-footer/site-footer.html -->'

  function injectDefaultShell(html) {
    let out = html
    if (!out.includes(headerInclude)) {
      out = out.replace(/(<body\b[^>]*>\s*)/i, `$1${headerInclude}\n`)
    }
    if (!out.includes(footerInclude)) {
      out = out.replace(/(\s*<\/body>)/i, `\n    ${footerInclude}$1`)
    }
    return out
  }

  return {
    name: 'opeka-includes',
    configureServer(server) {
      if (fs.existsSync(watchRoot)) server.watcher.add(watchRoot)
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const htmlWithDefaults = injectDefaultShell(html)
        if (!htmlWithDefaults.includes('@opeka-include')) return htmlWithDefaults
        return expandIncludes(root, htmlWithDefaults)
      },
    },
  }
}

export default defineConfig({
  root: projectRoot,
  publicDir: false,
  plugins: [opekaIncludesPlugin()],
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
    outDir: path.join(projectRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(pagesRoot, 'index.html'),
        home: path.join(pagesRoot, 'home.html'),
      },
    },
  },
})
