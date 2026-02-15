
const cols = document.querySelectorAll('div.tleID');
const wish = userTitles.wishlist || []
const watch = userTitles.watchedList || []



const wishforms = document.querySelectorAll('form#wishlist');
const watchforms = document.querySelectorAll('form#watched');

wishforms.forEach(form => {
    wish.map((w) => {
        if (w._id == Number(form.dataset.titleid)) {
            form.lastElementChild.lastChild.classList = ('bi bi-bookmark-fill')
            form.lastElementChild.dataset.bsTitle = "Remove From Wishlist"
            form.action = "/user/wishlist?_method=DELETE"
        }
    })
})

watchforms.forEach(form => {
    watch.map((w) => {
        if (w._id == Number(form.dataset.titleid)) {
            form.lastElementChild.lastChild.classList = ('fa-solid fa-circle-check')
            form.lastElementChild.dataset.bsTitle = "Watched"
            form.action = "/user/watched?_method=DELETE"
        }
    })
})

