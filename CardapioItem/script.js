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
        </div>
    `)
        const removeButton = document.getElementById(cardapioitem.id)
        removeButton.addEventListener("click", () => {

            console.log("Deletar pedido", cardapioitem.id)
            removeReserva(cardapioitem.id)
        })

    })
}

get()
async function removeCardapioitem(id) {

    const response = await fetch(`${baseUrl}/api/CardapioItem/${id}`,
        {
            method: "DELETE"
        })
    console.log(response, "response delete")
}