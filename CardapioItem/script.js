const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/CardapioItem`, {
        headers: headers
    })
    console.log(res, "res")
    const cardapioitem = await res.json()
    console.log(cardapioitem, "CardapioItems")
    const container = document.querySelector(".container")
    cardapioitem.forEach(cardapioitem => {
        let preparo = cardapioitem === "Sim"
        if (cardapioitem.possuiPreparo) {
            preparo = "Sim"
        } else {
            preparo = "Não"

        }
        container.insertAdjacentHTML("beforeend", `
        <div class="cardapioitem">
            <p>Id: ${cardapioitem.id}</p>
            <p>Item ${cardapioitem.titulo}</p>
            <p>Descrição: ${cardapioitem.descricao}</p>
            <p>Preço: ${cardapioitem.preco}</p>
            <p>Possui Preparo: ${preparo}</p>
            <button id=${cardapioitem.id}>Cancelar o Pedido</button>
             <button id="${cardapioitem.id}_edit">Editar cardapio</button>
        </div>
    `)
        const removeButton = document.getElementById(cardapioitem.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar pedido", cardapioitem.id)
            removeCardapioitem(cardapioitem.id)

        })
        const editBtnton = document.getElementById(`${cardapioitem.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(cardapioitem)
        })

    })
}

get()
function openEditModal(CardapioItem) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${CardapioItem.titulo}" id="titulo"/>
            <input type="text" value="${CardapioItem.descricao}" id="descricao"/>
            <input type="text" value="${CardapioItem.preco}" id="preco"/>
            <input type="text" value="${CardapioItem.possuiPreparo}" id="possuiPreparo"/>

            <button id="update">Salvar</button>
        </div>
    </div>
        `)

    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objCardapioItemUpdate = {
            titulo: document.getElementById("titulo").value,
            descricao: document.getElementById("descricao").value,
            preco: Number(document.getElementById("preco").value),
            possuiPreparo: document.getElementById("possuipreparo").value
        }
        const response = await fetch(`${baseUrl}/api/CardapioItem/${CardapioItem.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objCardapioItemUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            location.reload()
        }
    })
}


async function removeCardapioitem(id) {

    const response = await fetch(`${baseUrl}/api/CardapioItem/${id}`,
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
            <input type="text" id="titulo"/>
            <input type="text"  id="descricao"/>
            <input type="text" id="preco"/>
            <div>
                <label for="possuiPreparo">Possui Preparo:</label>
                <input type="checkbox"  id="possuiPreparo"/>
            </div>

            <button id="create">Salvar</button>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {
            if (!document.getElementById("titulo").value) {
                //alert("O campo título é obrigatório.")
            }
            const cardapioItem = {
                titulo: document.getElementById("titulo").value,
                descricao: document.getElementById("descricao").value,
                preco: Number(document.getElementById("preco").value),
                possuiPreparo: document.getElementById("possuiPreparo").checked
            }
            const response = await fetch(`${baseUrl}/api/CardapioItem`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(cardapioItem)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })
    })

}
openCreateModal()