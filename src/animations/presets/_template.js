/**
 * data-anim="<name>"
 *
 * RENAME this file and register in engine.js.
 * Describe: visual effect, data-anim-* params, dependencies (GSAP/ScrollTrigger/etc).
 */

export function initTemplate(root = document) {
  const targets = root.querySelectorAll('[data-anim="_template"]')
  if (!targets.length) return

  targets.forEach((_el) => {
    // effect logic
  })
}