/**
 * advantages.js — pinned scroll-driven twin-panel animation.
 * Left panel: text slides crossfade. Right panel: slides reveal upward.
 * Progress nav bar scrolls to track the active step.
 * Uses GSAP ScrollTrigger (scrub).
 */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pad2 = (n) => String(n).padStart(2, '0')

function applyFinalState(gsap, section) {
  const slidesLeft = gsap.utils.toArray('.advantages__panel--left .advantages__slide', section)
  const slidesRight = gsap.utils.toArray('.advantages__panel--right .advantages__slide', section)
  const steps = gsap.utils.toArray('.advantages__progress-step', section)
  const counterCurrent = section.querySelector('.advantages__counter-current')
  const n = steps.length

  // Show last slide in both panels
  gsap.set(slidesLeft, { autoAlpha: 0 })
  gsap.set(slidesLeft[n - 1], { autoAlpha: 1 })
  gsap.set(slidesRight, { autoAlpha: 1, yPercent: 0 })

  steps.forEach((el, i) => el.classList.toggle('is-active', i === n - 1))
  if (counterCurrent) counterCurrent.textContent = pad2(n)
}

function buildTimeline(gsap, ScrollTrigger, section) {
  const steps = gsap.utils.toArray('.advantages__progress-step', section)
  const slidesLeft = gsap.utils.toArray('.advantages__panel--left .advantages__slide', section)
  const slidesRight = gsap.utils.toArray('.advantages__panel--right .advantages__slide', section)
  const counterCurrent = section.querySelector('.advantages__counter-current')
  const counterTotal = section.querySelector('.advantages__counter-total')
  const stepBar = section.querySelector('.advantages__progress-steps')
  const stepClip = section.querySelector('.advantages__progress-clip')
  const n = steps.length

  if (!n || !slidesLeft.length || !slidesRight.length) return

  if (counterTotal) counterTotal.textContent = pad2(n)

  // ── Initial state ──
  gsap.set(slidesLeft, { autoAlpha: 0 })
  gsap.set(slidesLeft[0], { autoAlpha: 1 })
  gsap.set(slidesRight[0], { autoAlpha: 1, yPercent: 0 })
  gsap.set(slidesRight.slice(1), { autoAlpha: 1, yPercent: 100 })
  gsap.set(stepBar, { x: 0 })

  let activeStep = 0

  function setStep(i) {
    if (i === activeStep) return
    activeStep = i
    steps.forEach((el, idx) => el.classList.toggle('is-active', idx === i))
    if (counterCurrent) counterCurrent.textContent = pad2(i + 1)
  }

  function slipBar() {
    const p = tl.scrollTrigger?.progress
    if (!Number.isFinite(p)) return
    const maxShift = Math.max(0, stepBar.offsetWidth - stepClip.clientWidth)
    gsap.set(stepBar, { x: -p * maxShift })
  }

  // ── Timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: `+=${n * 50}%`,
      pin: true,
      scrub: true,
      onUpdate() {
        slipBar()
        const step = Math.min(n - 1, Math.max(0, Math.floor(tl.time() / 0.5 + 1e-6)))
        setStep(step)
      },
    },
  })

  steps.forEach((_, j) => {
    if (j === 0) return
    const t = 0.5 * j
    // Right panel: slide-up reveal
    tl.fromTo(slidesRight[j], { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'none' }, t)
    // Left panel: crossfade
    tl.to(slidesLeft[j], { autoAlpha: 1, duration: 0.25, ease: 'none' }, t)
    tl.to(slidesLeft[j - 1], { autoAlpha: 0, duration: 0.25, ease: 'none' }, t)
  })

  // Sync bar position and active step after layout is ready
  gsap.delayedCall(0, () => {
    ScrollTrigger.refresh()
    slipBar()
    setStep(Math.min(n - 1, Math.max(0, Math.floor(tl.time() / 0.5 + 1e-6))))
  })
}

export async function initAdvantages(root = document) {
  const sections = root.querySelectorAll('[data-advantages]')
  if (!sections.length) return

  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)

  sections.forEach((section) => {
    if (section.dataset.advantagesReady === 'true') return
    section.dataset.advantagesReady = 'true'

    if (REDUCED_MOTION) {
      applyFinalState(gsap, section)
      return
    }

    buildTimeline(gsap, ScrollTrigger, section)
  })
}
