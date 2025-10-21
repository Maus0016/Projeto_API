const baseUrl = "https://localhost:7134"
async function get(){
    const res = await fetch(`${baseUrl}/api/Usuario`)
    const users = await Response.json
}
get()
async function create(params) {
    const res = await fetch("https://localhost:7134/api/Usuario")
}

function init(){
    const form = document.querySelector("form")
    form.addEventListener("submit", (event)=>{
        event.preventDefault()
        createuser()

    })
}
init()

function abrirModal(){
    const body = document.body

    body.insertAdjacentElement("beforeend")
}

function toastify(tipo,mensagem){
    document.body.insertAdjacentHTML("beforeend",`
        <div class="toastify ${tipo}">
        <p>${mensagem}<p>
        </div>
    `)
}