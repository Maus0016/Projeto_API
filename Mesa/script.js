const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/Mesa`, {
        headers: headers
    })
    console.log(res, "res")
    const mesa = await res.json()
    console.log(mesa, "mesas")
    const container = document.querySelector(".container")
    mesa.forEach(mesa => {
        let situacao = "Disponivel"
        if (mesa.situacaoMesa === 1) {
            situacao = "Ocupada"
        } else if (mesa.situacaoMesa === 2) {
            situacao = "Reservada"
        }
        container.insertAdjacentHTML("beforeend", `
              <div class="mesa">
            <p>Mesa ${mesa.numeroMesa}</p>
            <p>Status: ${situacao}</p>
             <button id="${mesa.id}_edit">Editar Mesa</button>
            <button id=${mesa.id}>Deletar Mesa</button>
        </div>
            
            `)
        const removeButton = document.getElementById(mesa.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar Mesa", mesa.id)
            removeMesa(mesa.id)
        })
        const editBtnton = document.getElementById(`${mesa.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(mesa)
        })

    })
}
get()
function openEditModal(mesa) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
            <input type="text" value="${mesa.numeroMesa}" id="numeroMesa"/>
            <input type="text" value="${mesa.situacaoMesa}" id="situacaoMesa"/>
          

            <button id="update">Salvar</button>
        </div>
    </div>
        `)
    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objMesaUpdate = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            situacaoMesa: document.getElementById("SituacaoMesa").value
        }
        const response = await fetch(`${baseUrl}/api/Mesa/${mesa.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objMesaUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            location.reload()
        }
    })

}
async function removeMesa(id) {
    const response = await fetch(`${baseUrl}/api/Mesa/${id}`,
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
            <input type="text" id="numeroMesa"/>
            <input type="text"  id="SituacaoMesa"/>
          
            <button id="create">Salvar</button>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {

            const Mesa = {
                numeroMesa: Number(document.getElementById("numeroMesa").value),
                situacaoMesa: document.getElementById("SituacaoMesa").value
            }
            const response = await fetch(`${baseUrl}/api/Mesa`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(Mesa)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })
    })

}
openCreateModal()