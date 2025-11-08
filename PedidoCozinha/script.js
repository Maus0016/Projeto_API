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
        <button id=${pedidocozinha.id}>Cancelar Pedido de Cozinha</button>
    </div>
    `)
        const removeButton = document.getElementById(pedidocozinha.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar Pedido da Cozinha", pedidocozinha.id)
            removeUsuario(pedidocozinha.id)
        })
    })

}
get()
async function removePedidoCozinha(id) {

    const response = await fetch(`${baseUrl}/api/PedidoCozinha/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}