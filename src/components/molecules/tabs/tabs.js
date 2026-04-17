/**
 * Initializes tab switching behavior for all `.tabs` elements within the given root.
 *
 * Listens for click events on tab buttons (`.tab--default` or `.tab--active`),
 * deactivates all sibling buttons by swapping them to `.tab--default`,
 * and marks the clicked button as active with `.tab--active`.
 *
 * @param {Document|Element} root - The root element to search for `.tabs` containers. Defaults to `document`.
 */
export function initTabs(root = document) {
  root.querySelectorAll('.tabs').forEach(tabs => {
    tabs.addEventListener('click', e => {
      const clicked = e.target.closest('.tab--default, .tab--active')
      if (!clicked || !tabs.contains(clicked)) return

      tabs.querySelectorAll('.tab--default, .tab--active').forEach(btn => {
        btn.classList.remove('tab--active')
        btn.classList.add('tab--default')
      })

      clicked.classList.remove('tab--default')
      clicked.classList.add('tab--active')
    })
  })
}
