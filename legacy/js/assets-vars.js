import heroBlob from '../assets/images/hero-blob.png?url'
import promoGlow from '../assets/images/promo-glow.png?url'
export { default as introVideoUrl } from '../assets/videos/intro.mp4?url'

const root = document.documentElement
root.style.setProperty('--opeka-img-hero-blob', `url(${JSON.stringify(heroBlob)})`)
root.style.setProperty('--opeka-img-promo-glow', `url(${JSON.stringify(promoGlow)})`)
