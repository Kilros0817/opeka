import './assets-vars.js'
import '../styles/main.scss'

import '../components/button/button.scss'
import '../components/cta-excursion/cta-excursion.scss'
import '../components/divider-block/divider-block.scss'
import '../components/logo/logo.scss'
import '../components/pager/pager.scss'
import '../components/promo-card/promo-card.scss'
import '../components/scroll-hint/scroll-hint.scss'
import '../components/tag/tag.scss'
import '../components/text-link/text-link.scss'

import '../sections/site-header/site-header.scss'
import '../sections/hero/hero.scss'
import '../sections/benefits/benefits.scss'
import '../sections/site-footer/site-footer.scss'

import { initHero } from './modules/scenes/hero.js'


// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Autoplay hero video
  const video = document.querySelector('.hero__video')
  if (video) video.play().catch(() => {})

})

initHero()

