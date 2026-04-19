/**
 * boardinghouse.js — horizontal loop slider for pansionat cards.
 * Uses GSAP + Draggable with the horizontalLoop helper.
 */

// ── horizontalLoop helper (adapted from GSAP demo) ───────────────────────────

function horizontalLoop(items, config, gsap, Draggable) {
  let timeline
  items = gsap.utils.toArray(items)
  config = config || {}

  gsap.context(() => {
    const onChange = config.onChange
    let lastIndex = 0
    const tl = gsap.timeline({
      repeat: config.repeat ?? -1,
      onUpdate: onChange && function () {
        const i = tl.closestIndex()
        if (lastIndex !== i) {
          lastIndex = i
          onChange(items[i], i)
        }
      },
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    })

    const length = items.length
    const startX = items[0].offsetLeft
    const times = []
    const widths = []
    const spaceBefore = []
    const xPercents = []
    let curIndex = 0
    const center = config.center
    const pixelsPerSecond = (config.speed || 1) * 100
    const snap = config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1)
    let timeOffset = 0
    const container = center === true
      ? items[0].parentNode
      : gsap.utils.toArray(center)[0] || items[0].parentNode

    let totalWidth
    const getTotalWidth = () =>
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      spaceBefore[0] +
      items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], 'scaleX') +
      (parseFloat(config.paddingRight) || 0)

    const populateWidths = () => {
      let b1 = container.getBoundingClientRect(), b2
      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px'))
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px')) / widths[i]) * 100 +
          gsap.getProperty(el, 'xPercent')
        )
        b2 = el.getBoundingClientRect()
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left)
        b1 = b2
      })
      gsap.set(items, { xPercent: (i) => xPercents[i] })
      totalWidth = getTotalWidth()
    }

    let timeWrap
    const populateOffsets = () => {
      timeOffset = center
        ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
        : 0
      center && times.forEach((t, i) => {
        times[i] = timeWrap(
          tl.labels['label' + i] +
          (tl.duration() * widths[i]) / 2 / totalWidth -
          timeOffset
        )
      })
    }

    const getClosest = (values, value, wrap) => {
      let i = values.length, closest = 1e10, index = 0, d
      while (i--) {
        d = Math.abs(values[i] - value)
        if (d > wrap / 2) d = wrap - d
        if (d < closest) { closest = d; index = i }
      }
      return index
    }

    const populateTimeline = () => {
      tl.clear()
      for (let i = 0; i < length; i++) {
        const item = items[i]
        const curX = (xPercents[i] / 100) * widths[i]
        const distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0]
        const distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX')
        tl.to(item, {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        }, 0)
          .fromTo(item,
            { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
            {
              xPercent: xPercents[i],
              duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add('label' + i, distanceToStart / pixelsPerSecond)
        times[i] = distanceToStart / pixelsPerSecond
      }
      timeWrap = gsap.utils.wrap(0, tl.duration())
    }

    const refresh = (deep) => {
      const progress = tl.progress()
      tl.progress(0, true)
      populateWidths()
      deep && populateTimeline()
      populateOffsets()
      deep && tl.draggable && tl.paused()
        ? tl.time(times[curIndex], true)
        : tl.progress(progress, true)
    }

    gsap.set(items, { x: 0 })
    populateWidths()
    populateTimeline()
    populateOffsets()
    window.addEventListener('resize', () => refresh(true))

    function toIndex(index, vars) {
      vars = vars || {}
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length)
      const newIndex = gsap.utils.wrap(0, length, index)
      let time = times[newIndex]
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1)
      }
      if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap }
      curIndex = newIndex
      vars.overwrite = true
      gsap.killTweensOf(proxy)
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars)
    }

    tl.toIndex = (index, vars) => toIndex(index, vars)
    tl.closestIndex = (setCurrent) => {
      const index = getClosest(times, tl.time(), tl.duration())
      if (setCurrent) { curIndex = index }
      return index
    }
    tl.current = () => curIndex
    tl.next = (vars) => toIndex(tl.current() + 1, vars)
    tl.previous = (vars) => toIndex(tl.current() - 1, vars)
    tl.times = times
    tl.progress(1, true).progress(0, true)

    if (config.reversed) {
      tl.vars.onReverseComplete()
      tl.reverse()
    }

    // Draggable support
    let proxy
    if (config.draggable && typeof Draggable === 'function') {
      proxy = document.createElement('div')
      let startProgress, dragRatio

      Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: 'x',
        onPressInit() {
          gsap.killTweensOf(tl)
          tl.pause()
          startProgress = tl.progress()
          refresh()
          dragRatio = 1 / totalWidth
          gsap.set(proxy, { x: startProgress / -dragRatio })
        },
        onDrag() {
          tl.progress(gsap.utils.wrap(0, 1, startProgress + (this.startX - this.x) * dragRatio))
        },
        onRelease() {
          tl.closestIndex(true)
          const snapTime = times[getClosest(times, tl.time(), tl.duration())]
          gsap.to(tl, { time: snapTime, duration: 0.4, ease: 'power1.out', overwrite: true })
        },
      })
    }

    tl.closestIndex(true)
    lastIndex = curIndex
    onChange && onChange(items[curIndex], curIndex)
    timeline = tl
  })

  return timeline
}

// ── Init ─────────────────────────────────────────────────────────────────────

export async function initBoardinghouse(root = document) {
  const sections = root.querySelectorAll('[data-boardinghouse]')
  if (!sections.length) return

  const [{ default: gsap }, { Draggable }] = await Promise.all([
    import('gsap'),
    import('gsap/Draggable'),
  ])
  gsap.registerPlugin(Draggable)

  sections.forEach((section) => {
    if (section.dataset.boardinghouseReady === 'true') return
    section.dataset.boardinghouseReady = 'true'

    const slides = gsap.utils.toArray('.boardinghouse__slide', section)
    const btnPrev = section.querySelector('[data-slider-prev]')
    const btnNext = section.querySelector('[data-slider-next]')

    if (!slides.length) return

    let activeSlide

    const loop = horizontalLoop(slides, {
      paused: true,
      draggable: true,
      center: true,
      repeat: -1,
      onChange: (el) => {
        activeSlide?.classList.remove('active')
        el.classList.add('active')
        activeSlide = el
      },
    }, gsap, Draggable)

    btnPrev?.addEventListener('click', () =>
      loop.previous({ duration: 0.4, ease: 'power1.inOut' })
    )
    btnNext?.addEventListener('click', () =>
      loop.next({ duration: 0.4, ease: 'power1.inOut' })
    )

    // Click on any slide to center it
    slides.forEach((slide, i) =>
      slide.addEventListener('click', () =>
        loop.toIndex(i, { duration: 0.6, ease: 'power1.inOut' })
      )
    )
  })
}
