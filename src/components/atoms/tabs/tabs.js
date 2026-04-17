export function initTabs(root = document) {
  root.querySelectorAll('.tabs').forEach(tabs => {
    tabs.addEventListener('click', e => {
      const clicked = e.target.closest('[data-tab-status]')
      if (!clicked || !tabs.contains(clicked)) return

      tabs.querySelectorAll('[data-tab-status]').forEach(btn => {
        btn.dataset.tabStatus = 'default'
      })
      clicked.dataset.tabStatus = 'active'
    })
  })
}
