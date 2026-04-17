/**
 * avatar-button.js — toggle active state on click
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
  
  // Ensure avatar-img--active and aria-pressed are only on img, not on div
  btn.classList.remove('avatar-img--active')
  btn.removeAttribute('aria-pressed')
  
  // Check if img has active class on initial load and apply styles
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
    
    // If already active, do nothing (stay active)
    if (isActive) {
      return
    }
    
    // Find the parent container with all avatar buttons
    const container = this.parentElement
    const allButtons = container.querySelectorAll('[data-avatar-btn]')
    
    // Remove active state from all buttons in the container
    allButtons.forEach((otherBtn) => {
      const otherImg = otherBtn.querySelector('[data-avatar-img]')
      otherImg.classList.remove('avatar-img--active')
      otherBtn.classList.remove('avatar-img--active')
      otherImg.setAttribute('aria-pressed', 'false')
      otherBtn.removeAttribute('aria-pressed')
      otherImg.style.outline = 'none'
    })
    
    // Add active state to clicked button's img
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
  // Get color variant from parent button to apply correct outline color
  const btn = img.closest('[data-avatar-btn]')
  const isWhite = btn.classList.contains('avatar-btn--tr-white')
  const outlineColor = isWhite ? '#ffffff' : '#0066ff'
  
  img.style.outline = `2px solid ${outlineColor}`
  img.style.outlineOffset = '-2px'
}
