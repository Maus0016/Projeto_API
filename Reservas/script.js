const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/Reservas`, {
        headers: headers
    })
    console.log(res, "res")
    const Reservas = await res.json()
    console.log(Reservas, "Reservas")
    Reservas.forEach(Reserva => {
        const container = document.querySelector(".container")
        container.insertAdjacentHTML("beforeend", `
          <div class="Reservas">
        <p>Id: ${Reserva.id}</p>
        <p>Id: ${Reserva.Id}</p>
        <p>Numero da Mesa: ${Reserva.numeroMesa}</p>
        <p>Nome do Cliente: ${Reserva.nomeCliente}</p>
        <p>Telefone: ${Reserva.telefone}</p>
         <button id="${Reserva.id}_edit">Editar Reserva</button>
        <button id=${Reserva.id}>Cancelar Reserva</button>
    </div>
    
    `)
        const removeButton = document.getElementById(Reserva.id)
        removeButton.addEventListener("click", () => {
            console.log("deletar Reserva", Reserva.id)
            removeReserva(Reserva.id)
        })
        const editBtnton = document.getElementById(`${Reserva.id}_edit`)
        editBtnton.addEventListener("click", () => {
            openEditModal(Reserva)
        })

    });

}
get()
function openEditModal(Reserva) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">

        <div class="modal">
           
            <input type="text" value="${Reserva.numeroMesa}" id="numeroMesa"/>
            <input type="text" value="${Reserva.nomeCliente}" id="nomeCliente"/>
            <input type="text" value="${Reserva.telefone}" id="telefone"/>

            <button id="update">Salvar</button>
        </div>
    </div>
        `)

    const updateButton = document.getElementById("update")

    updateButton.addEventListener("click", async () => {
        const objReservaUpdate = {
            id: Reserva.id,
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            nomeCliente: document.getElementById("nomeCliente").value,
            telefone: Number(document.getElementById("telefone").value)
        }
        const response = await fetch(`${baseUrl}/api/Reserva/${Reserva.id}`,
            {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(objReservaUpdate)
            })

        console.log(response, "response edit")
        if (response.ok) {

            location.reload()
        }
    })
}

async function removeReserva(id) {

    const response = await fetch(`${baseUrl}/api/Reservas/${id}`,
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
            <input type="text" value="" id="telefone"/>

            <button id="update">Salvar</button>
        </div>
    </div>
        `)

        const createButton = document.getElementById("create")

        createButton.addEventListener("click", async () => {
            const Reservas = {
                id: Reservas.id,
                numeroMesa: Number(document.getElementById("numeroMesa").value),
                nomeCliente: document.getElementById("nomeCliente").value,
                telefone: Number(document.getElementById("telefone").value)
            }
            const response = await fetch(`${baseUrl}/api/Reservas`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(Reservas)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })
    })

}
openCreateModal()