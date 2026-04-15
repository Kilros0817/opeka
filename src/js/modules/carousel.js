export function initMobileCarousel() {
  const mobileCard = document.querySelector('.hero__promo-card-mobile')
  if (!mobileCard) return

  const slides = [
    {
      tag: 'Скидка 20%',
      title: 'Забота без переплат',
      desc: 'Дарим особые условия на проживание в наших пансионатах Санкт-Петербурга на 30 дней.'
    },
    {
      tag: 'Скидка 15%',
      title: 'Зимний чек-ап в «Опеке» по сниженной цене 119 990 ₽',
      desc: '14 дней восстановления здоровья за 119 990 ₽. Анализы, терапевт и проживание включены!'
    },
    {
      tag: 'рассрочка',
      title: 'Заезжайте сегодня, платите потом!',
      desc: 'Разделим стоимость программы на платежи от 31 531 ₽ / месяц'
    },
    {
      tag: 'Скидка 40%',
      title: 'Скидки при единовременной оплате',
      desc: 'Не пропустите эту возможность!'
    },
    {
      tag: 'Скидка',
      title: 'Круглосуточный профессиональный уход',
      desc: 'Акция на проживание в пансионатах от 3 300 ₽ / сутки'
    }
  ]

  const track = mobileCard.querySelector('[data-carousel-track]')
  const dotsContainer = mobileCard.querySelector('[data-carousel-dots]')
  let currentSlide = 0
  let touchStartX = 0
  let touchEndX = 0

  function createCard(slide) {
    return `
      <div class="carousel-card">
        <div class="promo-card__surface">
          <div class="promo-card__head">
            <div class="tag">
              <span class="tag__icon" aria-hidden="true">
                <svg class="hero__promo-icon" width="16" height="16">
                  <use href="../assets/icons/fire.svg"></use>
                </svg>
              </span>
              <span class="tag__text">${slide.tag}</span>
            </div>
          </div>
          <div class="promo-card__body">
            <div class="promo-card__text">
              <h2 class="promo-card__title">${slide.title}</h2>
              <p class="promo-card__desc">${slide.desc}</p>
            </div>
            <a class="text-link" href="#">
              <span class="text-link__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <use href="../assets/icons/plus.svg"></use>
                </svg>
              </span>
              <span class="text-link__label">Узнать больше</span>
            </a>
          </div>
        </div>
      </div>
    `
  }

  function renderCarousel() {
    track.innerHTML = slides.map(slide => createCard(slide)).join('')

    dotsContainer.innerHTML = slides.map((_, i) => `
      <button
        type="button"
        class="carousel-dot ${i === currentSlide ? 'carousel-dot--active' : ''}"
        data-slide="${i}"
        aria-label="Слайд ${i + 1}"
      ></button>
    `).join('')


    const cardWidth = track.querySelector('.carousel-card').offsetWidth + 8
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`

    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        currentSlide = parseInt(dot.dataset.slide)
        renderCarousel()
    
      })
    })
  }

  function handleSwipe() {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        currentSlide = (currentSlide + 1) % slides.length
      } else {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length
      }
      renderCarousel()
  
    }
  }

  // Touch events
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX
  })

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  })

  // Initialize
  renderCarousel()
}
