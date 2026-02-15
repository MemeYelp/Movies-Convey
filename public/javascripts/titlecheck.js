
const wishBtn = document.querySelector('#wishlistTitle')
const watchedBtn = document.querySelector('#watchedTitle')


const image = document.querySelector('img.img-fluid')
const div = image.parentElement

image.addEventListener('error', function() {
    div.lastElementChild.toggleAttribute("hidden")
    div.firstElementChild.toggleAttribute("hidden")
})


const wishlist = userTitles.wishlist || []
const watchedList = userTitles.watchedList || []


const wishlistForm = document.querySelector('#formWishlist')
const watchedForm = document.querySelector('#formWatched')



wishlist.forEach(wish => {
    if(wish._id == titleId){
        wishBtn.lastChild.classList = ('bi bi-bookmark-fill ps-2')
        wishBtn.firstChild.nodeValue = "Remove From Wishlist"
        wishlistForm.action = "/user/wishlist?_method=DELETE"
    }
});

watchedList.forEach(watch => {
    if(watch._id == titleId){
        watchedBtn.lastChild.classList = ('fa-solid fa-circle-check ps-2')
        watchedBtn.firstChild.nodeValue = "Watched";
        watchedForm.action = "/user/watched?_method=DELETE"
    }
});
