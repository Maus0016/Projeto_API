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
        <button>Fechar Comanda</button>

    </div>
    `)
    });


}
get()