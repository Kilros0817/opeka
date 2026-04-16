/** rAF-throttled scroll listener. Fires callback at most once per frame. */

const listeners = new Set()
let ticking = false
let bound = false

function onFrame() {
  listeners.forEach((fn) => fn())
  ticking = false
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(onFrame)
  }
}

function unbindIfIdle() {
  if (!bound || listeners.size > 0) return

  bound = false
  window.removeEventListener('scroll', onScroll)
}

export function onScrollFrame(callback) {
  listeners.add(callback)

  if (!bound) {
    bound = true
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  return () => {
    listeners.delete(callback)
    unbindIfIdle()
  }
}
