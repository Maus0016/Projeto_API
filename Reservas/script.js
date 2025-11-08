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
        <button>Criar Reserva</button>
    </div>
    `)

    });

}
get()