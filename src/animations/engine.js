/**
 * Animation engine — runs all data-anim presets.
 * Register GSAP plugins here when needed (ScrollTrigger, etc.).
 */

import { initRevealUp } from './presets/reveal-up.js'

const presets = [
  initRevealUp,
]

export function initAnimations(root = document) {
  presets.forEach((init) => {
    try {
      init(root)
    } catch (err) {
      window.dispatchEvent(new CustomEvent('opeka:animation-error', {
        detail: { preset: init.name, error: err },
      }))
    }
  })
}
