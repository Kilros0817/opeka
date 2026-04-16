/**
 * promo-mini-slider.js — stack carousel with auto-rotate and progress bar.
 *
 * Pagination buttons are synced to card count automatically.
 * Pauses on hover/focus; respects prefers-reduced-motion.
 * Idempotent — safe to call after AJAX.
 */

const DEFAULT_INTERVAL = 5000
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const MOBILE_MQ = window.matchMedia('(max-width: 767px)')

export function initPromoMiniSliders(root = document) {
  root.querySelectorAll('[data-promo-mini-slider]').forEach((slider) => {
    if (slider.dataset.promoMiniSliderReady === 'true') return
    init(slider)
  })
}

function init(slider) {
  const cards = Array.from(slider.querySelectorAll('.promo-mini-card'))
  if (cards.length === 0) return

  slider.dataset.promoMiniSliderReady = 'true'
  slider.setAttribute('aria-live', 'polite')
  slider.setAttribute('aria-atomic', 'true')

  const interval = Number(slider.dataset.rotate) || DEFAULT_INTERVAL
  const controls = slider.querySelector('.promo-mini-slider__controls')
  const pagination = controls?.querySelector('.pagination')
  const prevBtn = controls?.querySelector('[data-slider-prev]')
  const nextBtn = controls?.querySelector('[data-slider-next]')

  const tabs = pagination ? syncTabs(pagination, cards.length) : []

  let activeIndex = 0
  let timerId = null
  let progressStart = 0
  let progressRemaining = interval
  let isPaused = false

  function render() {
    const isMobile = MOBILE_MQ.matches
    const count = cards.length
    cards.forEach((card, idx) => {
      card.setAttribute('aria-label', `Слайд ${idx + 1} из ${count}`)
      const relativePos = (idx - activeIndex + count) % count

      if (isMobile) {
        card.removeAttribute('data-pos')
        card.removeAttribute('inert')
        card.removeAttribute('aria-hidden')
      } else {
        card.dataset.pos = String(relativePos)
        if (relativePos === 0) {
          card.removeAttribute('inert')
          card.setAttribute('aria-hidden', 'false')
        } else {
          card.setAttribute('inert', '')
          card.setAttribute('aria-hidden', 'true')
        }
      }
    })

    tabs.forEach((tab, idx) => {
      const isActive = idx === activeIndex
      tab.setAttribute('aria-current', isActive ? 'true' : 'false')

      if (isActive) {
        tab.classList.remove('pagination__dot')
        tab.classList.add('pagination__bar')
        if (!tab.querySelector('.pagination__bar-fill')) {
          const fill = document.createElement('span')
          fill.className = 'pagination__bar-fill'
          tab.appendChild(fill)
        }
      } else {
        tab.classList.remove('pagination__bar')
        tab.classList.add('pagination__dot')
        tab.querySelector('.pagination__bar-fill')?.remove()
      }
    })
  }

  function goTo(index) {
    activeIndex = (index + cards.length) % cards.length
    render()
    restartProgress()
  }

  function next() { goTo(activeIndex + 1) }
  function prev() { goTo(activeIndex - 1) }

  function clearTimer() {
    if (timerId !== null) {
      window.clearTimeout(timerId)
      timerId = null
    }
  }

  function getActiveFill() {
    return tabs[activeIndex]?.querySelector('.pagination__bar-fill') ?? null
  }

  function runProgress(fromPercent, durationMs) {
    const fill = getActiveFill()
    if (!fill) return
    fill.style.transition = 'none'
    fill.style.width = `${fromPercent}%`
    /* Double rAF to ensure the browser paints the starting width first. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.transition = `width ${durationMs}ms linear`
        fill.style.width = '100%'
      })
    })
  }

  function startTimer() {
    if (REDUCED_MOTION || MOBILE_MQ.matches) return
    clearTimer()
    progressStart = performance.now()
    timerId = window.setTimeout(next, progressRemaining)
  }

  function pauseTimer() {
    if (REDUCED_MOTION || isPaused) return
    isPaused = true
    clearTimer()

    /* Freeze the progress bar at its current computed width. */
    const fill = getActiveFill()
    if (fill) {
      const currentWidth = getComputedStyle(fill).width
      fill.style.transition = 'none'
      fill.style.width = currentWidth
    }

    const elapsed = performance.now() - progressStart
    progressRemaining = Math.max(0, progressRemaining - elapsed)
  }

  function resumeTimer() {
    if (REDUCED_MOTION || !isPaused) return
    isPaused = false

    const fill = getActiveFill()
    if (fill) {
      const parent = fill.parentElement
      const parentWidth = parent?.getBoundingClientRect().width || 1
      const percent = (fill.getBoundingClientRect().width / parentWidth) * 100
      runProgress(percent, progressRemaining)
    }

    startTimer()
  }

  function restartProgress() {
    clearTimer()
    isPaused = false
    progressRemaining = interval
    runProgress(0, interval)
    startTimer()
  }

  /* Events */
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => goTo(idx))
  })
  prevBtn?.addEventListener('click', prev)
  nextBtn?.addEventListener('click', next)

  /* Pause on hover/focus. */
  slider.addEventListener('mouseenter', pauseTimer)
  slider.addEventListener('mouseleave', resumeTimer)
  slider.addEventListener('focusin', pauseTimer)
  slider.addEventListener('focusout', (event) => {
    if (slider.contains(event.relatedTarget)) return
    resumeTimer()
  })

  MOBILE_MQ.addEventListener('change', () => {
    render()
    if (MOBILE_MQ.matches) clearTimer()
    else restartProgress()
  })

  render()
  restartProgress()
}

/** Sync pagination button count with card count. */
function syncTabs(pagination, count) {
  const existing = Array.from(pagination.querySelectorAll('button'))

  existing.slice(count).forEach((btn) => btn.remove())

  for (let i = existing.length; i < count; i++) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'pagination__dot'
    pagination.appendChild(btn)
  }

  const tabs = Array.from(pagination.querySelectorAll('button'))
  tabs.forEach((btn, idx) => {
    btn.setAttribute('aria-label', `Перейти к слайду ${idx + 1}`)
    btn.setAttribute('aria-current', 'false')
  })
  return tabs
}
