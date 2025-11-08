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
        <button id=${Reserva.id}>Cancelar Reserva</button>
    </div>
    
    `)
        const removeButton = document.getElementById(Reserva.id)
        removeButton.addEventListener("click", () => {
            //delete user
            console.log("deletar Reserva", Reserva.id)
            removeReserva(Reserva.id)
        })

    });

}
get()

async function removeReserva(id) {

    const response = await fetch(`${baseUrl}/api/Reservas/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}