const cards = gsap.utils.toArray(".card");
const spacer = 20;
const minScale = 0.8;

const distributor = gsap.utils.distribute({ base: minScale, amount: 0.2 });

cards.forEach((card, index) => {
  
  ScrollTrigger.create({
    trigger: card,
    start: `top-=${index * spacer} top`,
    endTrigger: '.cards',
    end: `bottom top+=${200 + (cards.length * spacer)}`,
    pin: true,
    pinSpacing: false,
    id: 'pin',
    invalidateOnRefresh: true,
  });
});