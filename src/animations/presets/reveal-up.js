/**
 * data-anim="reveal-up"
 *
 * Fade-in + slide up on viewport enter. Pure CSS transition, no GSAP.
 *   data-anim-delay="0.1"    — start delay (s)
 *   data-anim-duration="0.6" — transition length (s, default 0.5)
 *   data-anim-y="40"         — slide distance in px (default 24)
 */

const READY_CLASS = 'is-revealed'

const css = `
  [data-anim="reveal-up"] {
    opacity: 0;
    transform: translateY(var(--reveal-y, 24px));
    transition: opacity var(--reveal-duration, 0.5s) ease-out var(--reveal-delay, 0s),
                transform var(--reveal-duration, 0.5s) ease-out var(--reveal-delay, 0s);
    will-change: opacity, transform;
  }
  [data-anim="reveal-up"].${READY_CLASS} {
    opacity: 1;
    transform: translateY(0);
  }
`

let styleInjected = false

function injectStyles() {
  if (styleInjected) return
  const style = document.createElement('style')
  style.dataset.anim = 'reveal-up'
  style.textContent = css
  document.head.appendChild(style)
  styleInjected = true
}

export function initRevealUp(root = document) {
  const targets = root.querySelectorAll('[data-anim="reveal-up"]')
  if (!targets.length) return

  injectStyles()

  /* Respect prefers-reduced-motion. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add(READY_CLASS))
    return
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const delay = el.dataset.animDelay
        const duration = el.dataset.animDuration
        const y = el.dataset.animY
        if (delay) el.style.setProperty('--reveal-delay', `${delay}s`)
        if (duration) el.style.setProperty('--reveal-duration', `${duration}s`)
        if (y) el.style.setProperty('--reveal-y', `${y}px`)
        el.classList.add(READY_CLASS)
        obs.unobserve(el)
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  )

  targets.forEach((el) => observer.observe(el))
}