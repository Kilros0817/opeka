/**
 * avatar-button.js — toggle active state on click
 */

export function initAvatarButtons(root = document) {
  root.querySelectorAll('[data-avatar-btn]').forEach((btn) => {
    if (btn.dataset.avatarBtnReady === 'true') return
    init(btn)
  })
}

function init(btn) {
  btn.dataset.avatarBtnReady = 'true'
  
  btn.addEventListener('click', function() {
    const isActive = this.classList.contains('is-active')
    
    if (isActive) {
      this.classList.remove('is-active')
      this.setAttribute('aria-pressed', 'false')
    } else {
      this.classList.add('is-active')
      this.setAttribute('aria-pressed', 'true')
    }
  })
  
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this.click()
    }
  })
}
