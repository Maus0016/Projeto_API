const baseUrl = "https://localhost:7134"
async function get() {
    const res = await fetch(`${baseUrl}/api/Usuario`)
    const users = await Response.json
}
getUsuarios()
async function create(params) {
    const res = await fetch("https://localhost:7134/api/Usuario")
}

function init() {
    const form = document.querySelector("form")
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        createuser()

    })
}
init()

function abrirModal() {
    const body = document.body

    body.insertAdjacentElement("beforeend")
}

function toastify(tipo, mensagem) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="toastify ${tipo}">
        <p>${mensagem}<p>
        </div>
        `)
    const toas = document.querySelector(".toastify")
    setTimeout(() => {

        toas.remove()
    }, 3000);
}
async function createUsuario() {
    const name = document.querySelector("#name")
    const senha = document.querySelector("#senha")
    const usuario = {
        name: name.value,
        senha: senha.value
    }
    const response = await fetch(`${baseUrl}/users`,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(usuario)
        })

    console.log(response, "response")
    if (response.ok) {
        const UsuarioS = await response.json()
        console.log(UsuarioS, "users")
        toastify("Sucesso", "Usuario ou senha invalidos.")
    }
    else {
        toastify("Sucesso", "Login efetuado com sucesso!")
    }

}

async function removeUsuario() {

    const response = await fetch(`${baseUrl}/users/1`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}




