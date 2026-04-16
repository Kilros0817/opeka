/**
 * Footer nav accordion (mobile): `.accordionItem` gets `.is-open` when the row
 * trigger is clicked; CSS shows `.accordionContent` only when open.
 */
export function initFooterAccordion() {
    document.querySelectorAll('.accordionItem').forEach((item) => {
        const trigger = item.querySelector('.site-footer__bwn')
        const button = item.querySelector('.plus-button')
        if (!trigger) {
            return
        } else {
            trigger.addEventListener('click', (event) => {
                event.preventDefault()
                item.classList.toggle('is-open');
                button.textContent = item.classList[2] ? '−' : '+';
            })
        }
    })
}