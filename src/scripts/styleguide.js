/** Styleguide entry — extends main.js with showcase-only features. */

import './main.js'

/* Styleguide-only SCSS (excluded from production glob in main.js). */
import.meta.glob('/src/components/**/*.styleguide.scss', { eager: true })
import.meta.glob('/src/sections/**/*.styleguide.scss', { eager: true })
import '../pages/styleguide/styleguide.scss'

/* Highlight active nav link by matching pathname. */
const navLinks = document.querySelectorAll('.sg-nav__link')
const navTargets = document.querySelectorAll('[data-nav-target]')

if (navLinks.length && navTargets.length) {
  const path = location.pathname.split('/').pop()
  navLinks.forEach((link) => {
    const href = link.getAttribute('href')
    if (href && href.endsWith(path)) link.classList.add('is-active')
  })
}

/* Copy-to-clipboard for code snippets. */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const code = btn.closest('.sg-snippet')?.querySelector('code')
    if (!code) return
    try {
      await navigator.clipboard.writeText(code.textContent ?? '')
      const original = btn.textContent
      btn.textContent = 'Copied'
      btn.classList.add('is-copied')
      setTimeout(() => {
        btn.textContent = original
        btn.classList.remove('is-copied')
      }, 1200)
    } catch {
      btn.textContent = 'Failed'
    }
  })
})