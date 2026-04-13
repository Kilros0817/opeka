/**
 * Hook for progressive enhancement (e.g. async actions).
 * @param {ParentNode} [root]
 */
export function initButtons(root = document) {
  root.querySelectorAll('[data-button-async]').forEach((el) => {
    if (!(el instanceof HTMLButtonElement)) return
    el.addEventListener('click', () => {
      el.classList.add('button--loading')
      el.disabled = true
      window.setTimeout(() => {
        el.classList.remove('button--loading')
        el.disabled = false
      }, 1200)
    })
  })
}
