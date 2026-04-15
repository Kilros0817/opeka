import './assets-vars.js'
import '../styles/main.scss'

import '../components/button/button.scss'
import '../components/button/blueButton.scss'
import '../components/cta-excursion/cta-excursion.scss'
import '../components/divider-block/divider-block.scss'
import '../components/logo/logo.scss'
import '../components/pager/pager.scss'
import '../components/promo-card/promo-card.scss'
import '../components/carousel/carousel.scss'
import '../components/scroll-hint/scroll-hint.scss'
import '../components/tag/tag.scss'
import '../components/text-link/text-link.scss'

import '../sections/site-header/site-header.scss'
import '../sections/hero/hero.scss'
import '../sections/benefits/benefits.scss'
import '../sections/site-footer/site-footer.scss'
import { initFooterAccordion } from './modules/scenes/footer.js'
import { initHero } from './modules/scenes/hero.js'
import { initMobileCarousel } from './modules/carousel.js'


// // Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Autoplay hero video
  const video = document.querySelector('.hero__video')
  if (video) video.play().catch(() => { })

  initFooterAccordion()
})

initHero()
initMobileCarousel()

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugin — required
gsap.registerPlugin(ScrollTrigger);

// panels (❌ removed clone)
let panels = gsap.utils.toArray(".benefits_step");

// 🔹 PIN (keep)
panels.forEach((panel, idx) => {
  console.log(idx);
  if (idx + 1 < panels.length)
    ScrollTrigger.create({
      trigger: panel,
      start: "top top",
      pin: true,
      pinSpacing: false
    });
})

// 🔹 SNAP (keep)
let maxScroll;

let pageScrollTrigger = ScrollTrigger.create({
  snap(value) {
    let snappedValue = gsap.utils.snap(.1 / panels.length, value);

    if (snappedValue <= 0) {
      return 1.05 / maxScroll;
    } else if (snappedValue >= 1) {
      return maxScroll / (maxScroll + 1.05);
    }

    return snappedValue;
  }
});

// 🔹 LOOP SCROLL (keep — this handles looping)
window.addEventListener("scroll", (e) => {
  let scroll = pageScrollTrigger.scroll();

  if (scroll > maxScroll) {
    pageScrollTrigger.scroll(1);
    e.preventDefault();
  } else if (scroll < 1) {
    pageScrollTrigger.scroll(maxScroll - 1);
    e.preventDefault();
  }
}, { passive: false });

// gsap.to(".benefits_step-sticky", {
//   scrollTrigger: {
//     trigger: ".benefits_step-sticky",
//     start: "top, top",  // Pin when the top of the element reaches the top of the viewport
//     end: () => "+=" + (container.offsetHeight - 500),  // Stop pinning after scrolling 300px past the element
//     scrub: true,  // Smooth scrolling effect
//     pin: true,  // Pin the element in place
//     pinSpacing: false,  // Don't add extra space after the element
//   }
// });


