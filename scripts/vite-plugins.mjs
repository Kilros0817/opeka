import path from 'node:path'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render as renderHtml } from 'posthtml-render'
import postHtmlApi from 'posthtml/lib/api.js'
import posthtmlComponent from 'posthtml-component'
import { generateWebTypes } from './gen-web-types.mjs'

const { match: treeMatch } = postHtmlApi

export function statelessPosthtmlComponent(options) {
  return function (tree) {
    const fresh = {
      ...options,
      plugins: options.plugins
        ? {
            before: [...(options.plugins.before || [])],
            after: [...(options.plugins.after || [])],
          }
        : undefined,
    }
    return posthtmlComponent(fresh)(tree)
  }
}

export function componentFolders(projectRoot) {
  const roots = [
    'components/atoms',
    'components/molecules',
  ]

  return roots.flatMap((root) => {
    const absRoot = resolve(projectRoot, 'src', root)
    if (!existsSync(absRoot)) return []

    return readdirSync(absRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
      .map(entry => `${root}/${entry.name}`)
      .filter((folder) => {
        const name = path.basename(folder)
        return existsSync(resolve(projectRoot, 'src', folder, `${name}.html`))
      })
  })
}

export function webTypesWatcher() {
  const shouldRegen = p =>
    /[\\/]src[\\/](components|sections)[\\/].+\.html$/.test(p)
    && !p.includes('.styleguide.')
    && !p.includes('.inner.')

  let timer = null
  const regen = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      try { generateWebTypes() } catch (e) { console.error('[web-types]', e.message) }
    }, 100)
  }

  return {
    name: 'web-types-watcher',
    buildStart() { regen() },
    configureServer(server) {
      const onChange = (p) => {
        if (!shouldRegen(p)) return

        regen()
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}

export function sgSnippetPlugin() {
  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const dedent = s => {
    const lines = s.split('\n')
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    const indents = lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)
    const min = indents.length ? Math.min(...indents) : 0
    return lines.map(l => l.slice(min)).join('\n')
  }

  return function (tree) {
    treeMatch.call(tree, { tag: 'sg-snippet' }, node => {
      const title = (node.attrs && node.attrs.title) || 'HTML'
      const raw = renderHtml(node.content || [])
      const code = escape(dedent(raw))

      return {
        tag: 'div',
        attrs: { class: 'sg-snippet' },
        content: [
          {
            tag: 'div',
            attrs: { class: 'sg-snippet__bar' },
            content: [
              { tag: 'span', attrs: { class: 'sg-snippet__title' }, content: [title] },
              { tag: 'button', attrs: { type: 'button', class: 'sg-snippet__copy', 'data-copy': '' }, content: ['Copy'] },
            ],
          },
          {
            tag: 'pre',
            attrs: { class: 'sg-snippet__code' },
            content: [{ tag: 'code', content: [code] }],
          },
        ],
      }
    })
    return tree
  }
}

export function htmlSrcAssets(projectRoot) {
  const assetUrlRe = /(\s(?:poster|src|href)=["'])(\.\.\/\.\.\/assets\/([^"']+))(["'])/g
  const walkHtml = dir => readdirSync(dir).flatMap((name) => {
    const file = resolve(dir, name)
    const stat = statSync(file)

    if (stat.isDirectory()) return walkHtml(file)
    return file.endsWith('.html') ? [file] : []
  })

  return {
    name: 'html-src-assets',
    writeBundle(options) {
      const outDir = options.dir || resolve(projectRoot, 'dist')
      const emitted = new Map()

      for (const htmlFile of walkHtml(outDir)) {
        const html = readFileSync(htmlFile, 'utf8')
        const rewrittenHtml = html.replace(assetUrlRe, (match, before, url, relPath, quote) => {
          const absPath = resolve(projectRoot, 'src/assets', relPath)

          if (!emitted.has(absPath)) {
            const source = readFileSync(absPath)
            const ext = path.extname(relPath)
            const name = path.basename(relPath, ext)
            const hash = createHash('sha256').update(source).digest('hex').slice(0, 8)
            const fileName = `assets/${name}-${hash}${ext}`
            const outFile = resolve(outDir, fileName)

            mkdirSync(path.dirname(outFile), { recursive: true })
            if (!existsSync(outFile)) writeFileSync(outFile, source)
            emitted.set(absPath, fileName)
          }

          const fileName = emitted.get(absPath)
          const htmlName = path.posix.relative(outDir, htmlFile).replaceAll(path.sep, '/')
          const rewritten = path.posix.relative(path.posix.dirname(htmlName), fileName)

          return `${before}${rewritten.startsWith('.') ? rewritten : `./${rewritten}`}${quote}`
        })

        if (rewrittenHtml !== html) writeFileSync(htmlFile, rewrittenHtml)
      }
    },
  }
}
