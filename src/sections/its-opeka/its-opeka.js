/**
 * its-opeka.js — scroll-driven background gradients and blob animation.
 * Colors here must stay in sync with its-opeka.scss.
 */

import { onScrollFrame } from '../../scripts/modules/on-scroll-frame.js'

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const BLOB_STATES = {
  a: [
    { x: -400, y: -100, rotate: 10, opacity: 0.8 },
    { x: 500, y: 0, rotate: -45, opacity: 0.6 },
    { x: -200, y: -200, rotate: -30, opacity: 0 },
  ],
  b: [
    { x: -300, y: -400, rotate: 120, opacity: 0.7 },
    { x: 400, y: 200, rotate: 10, opacity: 0.85 },
    { x: 300, y: -100, rotate: 10, opacity: 0.8 },
  ],
  c: [
    { x: -600, y: -500, rotate: 0, opacity: 0.3 },
    { x: -600, y: -500, rotate: 0, opacity: 0.5 },
    { x: -400, y: -700, rotate: -54, opacity: 0.4 },
  ],
  d: [
    { x: -400, y: 200, rotate: 10, opacity: 0 },
    { x: -400, y: 0, rotate: 10, opacity: 0.4 },
    { x: -400, y: -200, rotate: 10, opacity: 0.7 },
  ],
  e: [
    { x: 600, y: -200, rotate: -5, opacity: 0 },
    { x: 600, y: -200, rotate: -5, opacity: 0.3 },
    { x: 600, y: -200, rotate: -5, opacity: 0 },
  ],
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function interpolateBlob(states, bg) {
  const segment = bg * (states.length - 1)
  const i = Math.min(Math.floor(segment), states.length - 2)
  const t = segment - i
  const a = states[i]
  const b = states[i + 1]
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rotate: lerp(a.rotate, b.rotate, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

function applyBlobState(el, state) {
  el.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.rotate}deg)`
  el.style.opacity = String(state.opacity)
}

function setStaticState(sticky, blobs) {
  sticky.style.setProperty('--expand', '1')
  sticky.style.setProperty('--bg', '1')

  Object.keys(BLOB_STATES).forEach((key) => {
    const el = blobs[key]
    if (!el) return

    applyBlobState(el, BLOB_STATES[key].at(-1))
  })
}

export function initItsOpeka(root = document) {
  root.querySelectorAll('[data-its-opeka]').forEach((section) => {
    if (section.dataset.itsOpekaReady === 'true') return

    const sticky = section.querySelector('.its-opeka__sticky')
    if (!sticky) return

    section.dataset.itsOpekaReady = 'true'

    const blobs = {}
    Object.keys(BLOB_STATES).forEach((key) => {
      blobs[key] = section.querySelector(`.its-opeka__blob--${key}`)
    })

    if (REDUCED_MOTION) {
      setStaticState(sticky, blobs)
      return
    }

    let stopScroll = null

    function onScroll() {
      if (!section.isConnected) {
        stopScroll?.()
        return
      }

      const rect = section.getBoundingClientRect()
      const sectionHeight = section.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollRange = sectionHeight - viewportHeight
      if (scrollRange <= 0) return

      const scrolled = Math.max(0, -rect.top)
      const totalProgress = Math.min(1, scrolled / scrollRange)

      // Phase 1: expand (0→25% of scroll range)
      const expand = Math.min(1, totalProgress / 0.25)
      sticky.style.setProperty('--expand', String(expand))

      // Phase 2: bg (25→100% of scroll range)
      const bg = Math.max(0, Math.min(1, (totalProgress - 0.25) / 0.75))
      sticky.style.setProperty('--bg', String(bg))

      // Update blob transforms
      Object.keys(BLOB_STATES).forEach((key) => {
        const el = blobs[key]
        if (!el) return
        const s = interpolateBlob(BLOB_STATES[key], bg)
        applyBlobState(el, s)
      })
    }

    stopScroll = onScrollFrame(onScroll)
    onScroll()
  })
}
