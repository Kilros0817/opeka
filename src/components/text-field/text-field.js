/**
 * @param {ParentNode} [root]
 */
export function initTextFields(root = document) {
  root.querySelectorAll('[data-text-field-validate]').forEach((wrapper) => {
    const input = wrapper.querySelector('.text-field__input')
    if (!(input instanceof HTMLInputElement)) return

    input.addEventListener('blur', () => {
      const empty = input.value.trim() === ''
      wrapper.classList.toggle('text-field--error', empty)
      input.setAttribute('aria-invalid', empty ? 'true' : 'false')
      const err = wrapper.querySelector('.text-field__error')
      if (err instanceof HTMLElement) {
        err.hidden = !empty
      }
    })
  })
}
