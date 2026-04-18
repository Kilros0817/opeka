/**
 * Applies dynamic background styles to avatar elements
 * via CSS custom properties read from data attributes.
 */

export function initAvatars(root = document) {
    root.querySelectorAll('[data-avatar]').forEach((el) => {
        if (el.dataset.avatarReady === 'true') return
        el.dataset.avatarReady = 'true'

        const bgType = el.dataset.bgType
        const bgFrom = el.dataset.bgFrom
        const bgTo = el.dataset.bgTo
        const bgImg = el.dataset.bgImg

        if (bgType === 'gradient' || bgType === 'solid') {
            if (bgFrom) el.style.setProperty('--avatar-bg-from', bgFrom)
            if (bgTo) el.style.setProperty('--avatar-bg-to', bgTo)
        }

        if (bgType === 'image' && bgImg) {
            el.style.setProperty('--avatar-bg-src', `url('${bgImg}')`)
        }
    })
}
