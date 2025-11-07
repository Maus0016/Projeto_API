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
            <button>Ocupar Mesa</button>
        </div>
            
            `)

    })
}
get()