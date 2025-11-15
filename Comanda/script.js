const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/Comanda`, {
        headers: headers
    })
    console.log(res, "res")
    const comandas = await res.json()
    console.log(comandas, "comandas")
    const container = document.querySelector(".container")
    comandas.forEach(comanda => {
        container.insertAdjacentHTML("beforeend", `
          <div class="comanda">
        <p>Id: ${comanda.id}</p>
        <p>Número da Mesa: ${comanda.numeroMesa}</p>
        <p>Status: ${comanda.nomeCliente}</p>
        <p>Itens: ${comanda.items}</p>
        <button id="${comanda.id}_edit">Editar Comanda</button> <!-- fazer o PUT -->
        <button id= ${comanda.id}>Excluir Comanda</button>
    </div>
    `)
        const removeButton = document.getElementById(comanda.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar Comanda", comanda.id)
            removeComanda(comanda.id)
        })
        const editBtnton = document.getElementById(`${comanda.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(comanda)
        })
    });


}
get()
function openEditModal(comanda) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${comanda.numeroMesa}" id="numeroMesa"/>
            <input type="text" value="${comanda.nomeCliente}" id="nomeCliente"/>
            <button id="update">Salvar</button>
        </div>
    </div>
        `)

    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objComandaUpdate = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            nomeCliente: document.getElementById("nomeCliente").value
        }
        const response = await fetch(`${baseUrl}/api/Comanda/${comanda.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objComandaUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            location.reload()
        }
    })
}
async function removeComanda(id) {

    const response = await fetch(`${baseUrl}/api/Comanda/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}

function openCreateModal() {
    const button = document.querySelector("#criar")
    button.addEventListener("click", () => {
        document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="" id="numeroMesa"/>
            <input type="text" value="" id="nomeCliente"/>
            <button id="update">Salvar</button>
        </div>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {
            const Comanda = {
                numeroMesa: Number(document.getElementById("numeroMesa").value),
                nomeCliente: document.getElementById("nomeCliente").value
            }
            const response = await fetch(`${baseUrl}/api/Comanda`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(Comanda)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })
    })

}
openCreateModal()