import { horizontalLoop } from '../../scripts/modules/horizontalLoop.js'

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
