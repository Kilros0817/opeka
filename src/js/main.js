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
// document.addEventListener('DOMContentLoaded', () => {
//   // Autoplay hero video
//   const video = document.querySelector('.hero__video')
//   if (video) video.play().catch(() => { })

// })

initHero()
initMobileCarousel()

import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
console.clear();

gsap.registerPlugin(Draggable);
const isMobile = window.matchMedia("(max-width: 768px)");
let slideDelay = 1.5,
  slideDuration = 2,
  slides = gsap.utils.toArray(".slide"),
  numSlides = slides.length,
  progressPerItem = 1 / (numSlides - 1),
  threshold = progressPerItem / 5,
  snapProgress = gsap.utils.snap(progressPerItem),
  snapProgressDirectional = (value, direction) => {
    let snapped = snapProgress(value);
    if (direction < 0 && value - snapped > threshold) {
      return snapped + progressPerItem;
    } else if (direction > 0 && snapped - value > threshold) {
      return snapped - progressPerItem;
    }
    return snapped;
  },
  slideHeight,
  totalHeight,
  slideAnimation,
  animation = gsap.to(slides, 1, {
    yPercent: "-=" + (numSlides - 1) * 100,
    ease: "none",
    paused: true
  }),
  draggable = new Draggable(document.createElement("div"), {
    // use a proxy element
    type: "y",
    edgeResistance: 0.9,
    dragResistance: 0.0,
    trigger: ".slides-container",
    onPress() {
      gsap.killTweensOf(animation);
      this.startProgress = animation.progress();
    },
    onDrag() {
      let change = (draggable.startX - draggable.y) / totalHeight;
      animation.progress(draggable.startProgress + change);
    },
    onRelease() {
      gsap.to(animation, {
        progress: snapProgressDirectional(
          animation.progress(),
          this.deltaY > 0 ? 1 : -1
        ),
        duration: slideDuration,
        overwrite: true
      });
    }
  });

function animateSlides(direction) {
  let progress = snapProgress(
    animation.progress() + direction * progressPerItem
  );
  if (progress >= 0 && progress <= 1) {
    slideAnimation = gsap.to(animation, {
      progress: progress,
      duration: slideDuration,
      overwrite: true
    });
  }
}

function resize() {
  slideHeight = slides[0].offsetHeight;
  totalHeight = slideHeight * numSlides;

  if (isMobile.matches) {
    animation.progress(0);
    draggable.startProgress = animation.progress();
  }
}
let isScrolling = false;

window.addEventListener("wheel", (e) => {
  if (isScrolling) return;

  isScrolling = true;

  let direction = e.deltaY > 0 ? 1 : -1;

  animateSlides(direction);

  setTimeout(() => {
    isScrolling = false;
  }, 600); // match your slideDuration
});
resize();

// window.addEventListener("resize", resize);
document
  .querySelector("#prevButton")
  // .addEventListener("click", () => animateSlides(-1));
document
  .querySelector("#nextButton")
  // .addEventListener("click", () => animateSlides(1));