export function initRate(root = document) {
    const rows = root.querySelectorAll('.rate')

    rows.forEach(row => {
        const stars = row.querySelectorAll('svg')

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const index = Number(star.dataset.index)

                updateStars(stars, index)
            })
        })
    })

    function updateStars(stars, count) {
        stars.forEach((star, i) => {
            const use = star.querySelector('use')

            if (i < count) {
                use.setAttribute('class', 'rating__color')
            } else {
                use.setAttribute('class', 'rating__color-empty')
            }
        })
    }
}