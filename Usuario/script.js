

const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/Usuario`, {
        headers: headers
    })
    console.log(res, "res")
    const users = await res.json()
    console.log(users, "users")
    users.forEach(user => {
        const container = document.querySelector(".container")
        container.insertAdjacentHTML("beforeend", `
          <div class="usuario">
        <p>Id: ${user.id}</p>
        <p>Nome: ${user.nome}</p>
        <p>Email: ${user.email}</p>
            <button id="${user.id}_edit">Editar Usuario</button>
        <button id=${user.id}>Deletar Usuario</button>
    </div>
    `)
        const removeButton = document.getElementById(user.id)
        removeButton.addEventListener("click", () => {
            //delete user
            console.log("deletar usuario", user.id)
            removeUsuario(user.id)
        })
        const editBtnton = document.getElementById(`${user.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(user)
        })
    })
}
get()
async function create(params) {
    const res = await fetch(`${baseUrl}/api/Usuario`)
}

function init() {
    const form = document.querySelector("form")
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        createuser()

    })
}
// init()

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
    const response = await fetch(`${baseUrl}/api/Usuario`,
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
function openEditModal(usuario) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${usuario.nome}" id="nome"/>
            <input type="text" value="${usuario.email}" id="email"/>
            <button id="update">Salvar</button>
        </div>
    </div>
        `)

    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objusuarioUpdate = {
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value
        }
        const response = await fetch(`${baseUrl}/api/Usuario/${usuario.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objusuarioUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            location.reload()
        }
    })
}

async function removeUsuario(id) {

    const response = await fetch(`${baseUrl}/api/Usuario/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}




