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
        <button>Encerra Comanda</button> <!-- fazer o PUT -->
        <button id= ${comanda.id}>Excluir Comanda</button>
    </div>
    `)
        const removeButton = document.getElementById(comanda.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar Comanda", comanda.id)
            removeUsuario(comanda.id)
        })

    });


}
get()
async function removeComanda(id) {

    const response = await fetch(`${baseUrl}/api/Comanda/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}