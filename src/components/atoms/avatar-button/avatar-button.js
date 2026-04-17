/**
 * 
 * Only one button in a pair can be active at a time (radio-button behavior)
 */

export function initAvatarButtons(root = document) {
  root.querySelectorAll('[data-avatar-img]').forEach((img) => {
    const btn = img.closest('[data-avatar-btn]')
    if (!btn || btn.dataset.avatarBtnReady === 'true') return
    init(btn)
  })
}

function init(btn) {
  btn.dataset.avatarBtnReady = 'true'
  const img = btn.querySelector('[data-avatar-img]')
  
  btn.classList.remove('avatar-img--active')
  btn.removeAttribute('aria-pressed')
  
  const isActive = img.classList.contains('avatar-img--active')
  if (isActive) {
    applyActiveStyles(img)
    img.setAttribute('aria-pressed', 'true')
  } else {
    img.setAttribute('aria-pressed', 'false')
  }
  
  btn.addEventListener('click', function(e) {
    e.stopPropagation()
    
    const imgElement = this.querySelector('[data-avatar-img]')
    const isActive = imgElement.classList.contains('avatar-img--active')
    
    if (isActive) {
      return
    }
    
    const container = this.parentElement
    const allButtons = container.querySelectorAll('[data-avatar-btn]')
    
    allButtons.forEach((otherBtn) => {
      const otherImg = otherBtn.querySelector('[data-avatar-img]')
      otherImg.classList.remove('avatar-img--active')
      otherBtn.classList.remove('avatar-img--active')
      otherImg.setAttribute('aria-pressed', 'false')
      otherBtn.removeAttribute('aria-pressed')
      otherImg.style.outline = 'none'
    })
    
    imgElement.classList.add('avatar-img--active')
    imgElement.setAttribute('aria-pressed', 'true')
    applyActiveStyles(imgElement)
  })
  
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this.click()
    }
  })
}

function applyActiveStyles(img) {
  
  const btn = img.closest('[data-avatar-btn]')
  const isWhite = btn.classList.contains('avatar-btn--tr-white')
  const outlineColor = isWhite ? '#ffffff' : '#0066ff'
  
  img.style.outline = `2px solid ${outlineColor}`
  img.style.outlineOffset = '-2px'
}
