gsap.registerPlugin(ScrollTrigger);

const pad2 = (n) => String(n).padStart(2, "0");

gsap.utils.toArray(".pin-section").forEach((section, sectionIndex) => {
  const steps      = gsap.utils.toArray(".scroll-progress__step", section);
  const slidesLeft = gsap.utils.toArray(".twin__panel--left .slide", section);
  const slidesRight= gsap.utils.toArray(".twin__panel--right .slide", section);
  const counterCurrent = section.querySelector(".slide-counter__current");
  const counterTotal   = section.querySelector(".slide-counter__total");
  const stepBar  = section.querySelector(".scroll-progress__steps");
  const stepClip = section.querySelector(".scroll-progress__clip");
  const n = steps.length;

  if (counterTotal) counterTotal.textContent = pad2(n);

  // ── Initial state ──
  gsap.set(slidesLeft, { autoAlpha: 0 });
  gsap.set(slidesLeft[0], { autoAlpha: 1 });
  gsap.set(slidesRight[0], { autoAlpha: 1, yPercent: 0 });
  gsap.set(slidesRight.slice(1), { autoAlpha: 1, yPercent: 100 });
  gsap.set(stepBar, { x: 0 });

  let activeStep = 0;

  function setStep(i) {
    if (i === activeStep) return;
    activeStep = i;
    steps.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
    if (counterCurrent) counterCurrent.textContent = pad2(i + 1);
  }

  function slipBar() {
    const p = tl.scrollTrigger?.progress;
    if (!Number.isFinite(p)) return;
    const maxShift = Math.max(0, stepBar.offsetWidth - stepClip.clientWidth);
    gsap.set(stepBar, { x: -p * maxShift });
  }

  // ── Timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: `+=${n * 50}%`,
      pin: true,
      scrub: true,
      id: sectionIndex + 1,
      onUpdate() {
        slipBar();
        const step = Math.min(n - 1, Math.max(0, Math.floor(tl.time() / 0.5 + 1e-6)));
        setStep(step);
      }
    }
  });

  steps.forEach((_, j) => {
    if (j === 0) return;
    const t = 0.5 * j;
    // Right: slide-up reveal
    tl.fromTo(slidesRight[j], { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "none" }, t);
    // Left: crossfade
    tl.to(slidesLeft[j],     { autoAlpha: 1, duration: 0.25, ease: "none" }, t);
    tl.to(slidesLeft[j - 1], { autoAlpha: 0, duration: 0.25, ease: "none" }, t);
  });

  // Init active step and bar position after layout
  gsap.delayedCall(0, () => {
    ScrollTrigger.refresh();
    slipBar();
    setStep(Math.min(n - 1, Math.max(0, Math.floor(tl.time() / 0.5 + 1e-6))));
  });
});
