/** Main entry — shared across all pages. */

import '../styles/main.scss'

/* Auto-import all component & section SCSS (excludes styleguide files). */
import.meta.glob(
  ['/src/components/**/*.scss', '!/src/components/**/*.styleguide.scss'],
  { eager: true },
)
import.meta.glob(
  ['/src/sections/**/*.scss', '!/src/sections/**/*.styleguide.scss'],
  { eager: true },
)

import { initAnimations } from '../animations/engine.js'
import { initPromoMiniSliders } from '../components/molecules/promo-mini-slider/promo-mini-slider.js'
import { initAvatarButtons } from '../components/atoms/avatar-button/avatar-button.js'
import { initItsOpeka } from '../sections/its-opeka/its-opeka.js'
import { initTabs } from '../components/atoms/tabs/tabs.js'

function init(root = document) {
  initAnimations(root)
  initPromoMiniSliders(root)
  initAvatarButtons(root)
  initItsOpeka(root)
  initTabs(root)
}

/* Public API for Bitrix: call window.OpekaFront.init(container) after AJAX. */
window.OpekaFront = { init }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init())
} else {
  init()
}