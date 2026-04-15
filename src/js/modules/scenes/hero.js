import { introVideoUrl } from '../../../js/assets-vars.js'

export function initHero(root = document) {
  root.querySelectorAll('[data-hero]').forEach((section) => {
    const video = section.querySelector('[data-hero-video]')
    if (video instanceof HTMLVideoElement) {
      video.src = introVideoUrl
    }
    
    // const pager = section.querySelector('[data-pager]')
    // if (!(pager instanceof HTMLElement)) return

    // const dots = pager.querySelectorAll('.pager__dot')
    // dots.forEach((dot) => {
    //   dot.addEventListener('click', () => {
    //     dots.forEach((d) => {
    //       d.classList.remove('pager__dot--active')
    //       d.setAttribute('aria-selected', 'false')
    //     })
    //     dot.classList.add('pager__dot--active')
    //     dot.setAttribute('aria-selected', 'true')
    //   })
    // })
  })
}
