const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/CategoriaCardapios`, {
        headers: headers
    })
}
console.log(res, "res")
const categoriacardapios = await res.json()
console.log(categoriacardapios, "categoriacardapios")
categoriacardapios.forEach(categoriacardapios => {
    const container = document.querySelector(".container")
    container.insertAdjacentHTML("beforeend", `
          <div class="CategoriaCardapios">
        <p>Id: ${categoriacardapios.Id}</p>
        <p>Tipo de Cardapio: ${categoriacardapios.nome}</p>
        <p>Descricao: ${categoriacardapios.descricao}</p>
    
         <button id="${categoriacardapios.id}_edit">Editar categoria </button>
        <button id=${categoriacardapios.id}>Cancelar cardapio</button>
    </div>
    
    `)
})
const removeButton = document.getElementById(categoriacardapios.id)
removeButton.addEventListener("click", () => {

    console.log("Deletar Categoria", categoriacardapios.id)
    removePedidoCozinha(categoriacardapios.id)

})
const editBtnton = document.getElementById(`${categoriacardapios.id}_edit`)
editBtnton.addEventListener("click", () => {
    openEditModal(categoriacardapios)
})

get()

function openEditModal(categoriacardapios) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${categoriacardapios.id}" id="id"/>
            <input type="text" value="${categoriacardapios.nome}" id="nome"/>
            <input type="text" value="${categoriacardapios.descricao}" id="descricao"/>
           
            <button id="update">Salvar</button>
        </div>
    </div>
        `)


    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objcategoriacardapioUpdate = {
            comandaId: Number(document.getElementById("id").value),
            nome: document.getElementById("nome").value,
            descricao: document.getElementById("descricao").value
        }
        const response = await fetch(`${baseUrl}/api/CategoriaCardapios/${categoriacardapios.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objcategoriacardapioUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            // location.reload()
        } else {
            console.error("Erro ao atualizar a categoria do cardapio")

        }

    })
}
async function removePedidoCozinha(id) {

    const response = await fetch(`${baseUrl}/api/CaegoriaCardapio/${id}`,
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
            <input type="text" value="" id="id"/>
            <input type="text" value="" id="nome"/>
            <input type="text" value="" id="descricao"/>
           
            <button id="update">Salvar</button>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {
            if (!document.getElementById("titulo").value) {
                //alert("O campo título é obrigatório.")
            }

            createButton.addEventListener("click", async () => {
                const categoriacardapios = {
                    id: Number(document.getElementById("id").value),
                    nome: document.getElementById("nome").value,
                    descricao: document.getElementById("descricao").value
                }
                const response = await fetch(`${baseUrl}/api/CategoriaCardapios`,
                    {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(categoriacardapios)
                    })

                console.log(response, "response edit")
                if (response.ok) {

                    //location.reload()
                }
            })


        })
        openCreateModal()
    })
}
