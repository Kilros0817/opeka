import { introVideoUrl } from '../../../js/assets-vars.js'

export function initHero(root = document) {
  root.querySelectorAll('[data-hero]').forEach((section) => {
    const video = section.querySelector('[data-hero-video]')
    if (video instanceof HTMLVideoElement) {
      video.src = introVideoUrl
    }
  })
}
