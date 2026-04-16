/**
 * RENAME: template → component name.
 * Import and call in src/scripts/main.js → init(root).
 */

export function initTemplate(root = document) {
  root.querySelectorAll('[data-template]').forEach((el) => {
    if (el.dataset.templateReady === 'true') return

    // Check required children before marking as ready.
    // e.g.: const items = el.querySelectorAll('.template__item')
    // if (items.length === 0) return

    el.dataset.templateReady = 'true'

    // component logic
  })
}