(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

const link = document.URL;
const ul = document.querySelectorAll('.page-link');

ul.forEach(list => {
    if (list.href.replace('#','') == link){
        list.classList.toggle('active-page', 'rounded-pill')
    }
})


const p = document.querySelectorAll('p');

p.forEach(p=> {
    if(p.outerHTML == "<p></p>"){
        p.remove()
    }
})


const searchArea = document.getElementById('search')
const path = document.location.pathname

if(path == '/titles/search'){
    searchArea.focus()
    searchArea.value = searchValue
}

window.addEventListener("keydown", (event) => {
    if(event.key == '/' ){
        event.preventDefault()
        searchArea.focus()
    }
})



const img = document.querySelectorAll('img.card-img')

img.forEach(img => {
    img.addEventListener('error', function() {
        const div = img.parentElement
        div.firstElementChild.toggleAttribute("hidden")
        div.lastElementChild.toggleAttribute("hidden")
    })
})

const login = document.getElementById('login')
const username = document.getElementById('username')

login.addEventListener('shown.bs.modal', () => {
  username.focus()
})


const firstname = document.getElementById('firstname')


const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


const navwish = document.getElementById('navwish')
const navlogin = document.getElementById('navlogin')

if(link.includes('/login') || link.includes('/register')){
    navlogin.classList.toggle('d-none')
    navwish.toggleAttribute("data-bs-toggle")
    navwish.toggleAttribute("href")
}

const livebtn = document.getElementById('bi-eye')
const rinput = document.getElementById('rpassword')

function show(){
    if(rinput.type == 'password'){
        rinput.type = "text"
        livebtn.classList = ('bi bi-eye')
    }else{
        rinput.type = "password"
        livebtn.classList = ('bi bi-eye-slash')
    }
}


const logeye = document.getElementById('l-eye')
const linput = document.getElementById('lpassword')

function lshow(){
    if(linput.type == 'password'){
        linput.type = "text"
        logeye.classList = ('bi bi-eye')
    }else{
        linput.type = "password"
        logeye.classList = ('bi bi-eye-slash')
    }
}