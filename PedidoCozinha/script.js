const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/PedidoCozinha`, {
        headers: headers
    })
    console.log(res, "res")
    const pedidocozinhas = await res.json()
    console.log(pedidocozinhas, "pedidoscozinha")
    pedidocozinhas.forEach(pedidocozinha => {
        const container = document.querySelector(".container")
        container.insertAdjacentHTML("beforeend", `
          <div class="pedidocozinha">
        <p>Id: ${pedidocozinha.id}</p>
        <p>Comanda Id: ${pedidocozinha.comandaId}</p>
        <p>Status: ${pedidocozinha.comanda}</p>
        <p>Itens: ${pedidocozinha.itens}</p>
        <button id="${pedidocozinha.id}_edit">Editar Pedido da Cozinha</button> <!-- fazer o PUT -->
        <button id=${pedidocozinha.id}>Cancelar Pedido de Cozinha</button>
    </div>
    `)
        const removeButton = document.getElementById(pedidocozinha.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar Pedido da Cozinha", pedidocozinha.id)
            removePedidoCozinha(pedidocozinha.id)

        })
        const editBtnton = document.getElementById(`${pedidocozinha.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(pedidocozinha)
        })
    })

}
get()

function openEditModal(pedidocozinha) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${pedidocozinha.comandaId}" id="comandaId"/>
           
            <button id="update">Salvar</button>
        </div>
    </div>
        `)

    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objPedidoCozinhaUpdate = {
            comandaId: Number(document.getElementById("comandaId").value)

        }
        const response = await fetch(`${baseUrl}/api/PedidoCozinha/${pedidocozinha.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objPedidoCozinhaUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            // location.reload()
        } else {
            console.error("Erro ao atualizar o pedido da cozinha")

        }
    })
}
async function removePedidoCozinha(id) {

    const response = await fetch(`${baseUrl}/api/PedidoCozinha/${id}`,
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
            <input type="text" value="" id="comandaId"/>
           
            <button id="update">Salvar</button>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {
            const PedidoCozinha = {
                comandaId: Number(document.getElementById("comandaId").value)


            }
            const response = await fetch(`${baseUrl}/api/PedidoCozinha`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(PedidoCozinha)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })
    })

}
openCreateModal()