/**
 * its-opeka.js — scroll-driven background + blob choreography.
 * Uses GSAP ScrollTrigger (scrub). This is the bespoke-animation pattern
 * for full-scene sequences; simple element reveals live in
 * src/animations/presets/.
 * Colors here must stay in sync with its-opeka.scss.
 */

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

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function applyFinalState(gsap, section, sticky) {
  gsap.set(sticky, { '--expand': 1, '--bg': 1 })
  Object.entries(BLOB_STATES).forEach(([key, states]) => {
    const el = section.querySelector(`.its-opeka__blob--${key}`)
    if (el) gsap.set(el, states.at(-1))
  })
}

function buildTimeline(gsap, section, sticky) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  })

  // Phase 1: expand the frame (0–25% of scroll)
  tl.fromTo(sticky, { '--expand': 0 }, { '--expand': 1, duration: 0.25, ease: 'none' }, 0)

  // Phase 2: gradient background fades in (25–100%)
  tl.fromTo(sticky, { '--bg': 0 }, { '--bg': 1, duration: 0.75, ease: 'none' }, 0.25)

  // Blobs: 3 keyframes per blob, interpolated across the bg phase
  Object.entries(BLOB_STATES).forEach(([key, states]) => {
    const el = section.querySelector(`.its-opeka__blob--${key}`)
    if (!el) return
    tl.fromTo(el, states[0], { ...states[1], duration: 0.375, ease: 'none' }, 0.25)
      .to(el, { ...states[2], duration: 0.375, ease: 'none' }, 0.625)
  })
}

export async function initItsOpeka(root = document) {
  const sections = root.querySelectorAll('[data-its-opeka]')
  if (!sections.length) return

  // Lazy-load GSAP only when this section is on the page.
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)

  sections.forEach((section) => {
    if (section.dataset.itsOpekaReady === 'true') return
    section.dataset.itsOpekaReady = 'true'

    const sticky = section.querySelector('.its-opeka__sticky')
    if (!sticky) return

    if (REDUCED_MOTION) {
      applyFinalState(gsap, section, sticky)
      return
    }

    buildTimeline(gsap, section, sticky)
  })
}