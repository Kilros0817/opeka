/**
 * advantages.js — scroll-driven animation, two modes:
 *
 * Desktop (≥768px): pinned twin-panel — left crossfades, right reveals upward.
 * Mobile  (≤767px): stacking cards — each card pins at top with pinSpacing:false.
 *
 * Uses GSAP ScrollTrigger (scrub / pin).
 */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pad2 = (n) => String(n).padStart(2, '0')

// ── Desktop ──────────────────────────────────────────────────────────────────

function buildDesktopTimeline(gsap, ScrollTrigger, section) {
  const steps       = gsap.utils.toArray('.advantages__progress-step .btn-step', section)
  const slidesLeft  = gsap.utils.toArray('.advantages__panel--left .advantages__slide', section)
  const slidesRight = gsap.utils.toArray('.advantages__panel--right .advantages__slide', section)
  const counterCurrent = section.querySelector('.advantages__counter-current')
  const counterTotal   = section.querySelector('.advantages__counter-total')
  const stepBar  = section.querySelector('.advantages__progress-steps')
  const stepClip = section.querySelector('.advantages__progress-clip')
  const n = steps.length

  if (!n || !slidesLeft.length || !slidesRight.length) return

  if (counterTotal) counterTotal.textContent = pad2(n)

  gsap.set(slidesLeft, { autoAlpha: 0 })
  gsap.set(slidesLeft[0], { autoAlpha: 1 })
  gsap.set(slidesRight[0], { autoAlpha: 1, yPercent: 0 })
  gsap.set(slidesRight.slice(1), { autoAlpha: 1, yPercent: 100 })
  gsap.set(stepBar, { x: 0 })

  let activeStep = 0

  function setStep(i) {
    if (i === activeStep) return
    activeStep = i
    steps.forEach((el, idx) => el.classList.toggle('btn-step--active', idx === i))
    if (counterCurrent) counterCurrent.textContent = pad2(i + 1)
  }

  function slipBar() {
    const p = tl.scrollTrigger?.progress
    if (!Number.isFinite(p)) return
    const maxShift = Math.max(0, stepBar.offsetWidth - stepClip.clientWidth)
    gsap.set(stepBar, { x: -p * maxShift })
  }

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
    tl.fromTo(slidesRight[j], { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'none' }, t)
    tl.to(slidesLeft[j],     { autoAlpha: 1, duration: 0.25, ease: 'none' }, t)
    tl.to(slidesLeft[j - 1], { autoAlpha: 0, duration: 0.25, ease: 'none' }, t)
  })

  gsap.delayedCall(0, () => {
    ScrollTrigger.refresh()
    slipBar()
    setStep(Math.min(n - 1, Math.max(0, Math.floor(tl.time() / 0.5 + 1e-6))))
  })
}

// ── Mobile ───────────────────────────────────────────────────────────────────

function buildMobileStack(gsap, ScrollTrigger, section) {
  const stack = section.querySelector('.advantages__stack')
  const cards = gsap.utils.toArray('.advantages__card', section)
  if (!cards.length || !stack) return

  const spacer    = 20    // px offset between pinned card tops
  const scaleStep = 0.05  // scale reduction per stacking level
  const n = cards.length

  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: `top-=${index * spacer} top`,
      endTrigger: stack,
      end: `bottom top+=${n * spacer}`,
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    })

    cards.slice(index + 1).forEach((laterCard, offset) => {
      gsap.to(card, {
        scale: 1 - scaleStep * (offset + 1),
        ease: 'none',
        scrollTrigger: {
          trigger: laterCard,
          start: 'top bottom',
          end: `top-=${index * spacer} top`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    })
  })
}

// ── Init ─────────────────────────────────────────────────────────────────────

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

    if (REDUCED_MOTION) return

    const mm = gsap.matchMedia()

    mm.add('(max-width: 767px)', () => {
      buildMobileStack(gsap, ScrollTrigger, section)
    })

    mm.add('(min-width: 768px)', () => {
      buildDesktopTimeline(gsap, ScrollTrigger, section)
    })
  })
}
