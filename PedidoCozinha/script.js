const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

// ------------------------------
// LOAD ALL PEDIDOS DA COZINHA
// ------------------------------
async function get() {
    const res = await fetch(`${baseUrl}/api/PedidoCozinha`, { headers });
    const pedidos = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // remove static items

    pedidos.forEach(pedido => {
        let statusClass = "pendente";

        if (pedido.status === "Preparo") statusClass = "preparo";
        if (pedido.status === "Pronto") statusClass = "pronto";

        container.insertAdjacentHTML("beforeend", `
            <div class="pedido ${statusClass}">
                <h2>Pedido #${pedido.id}</h2>
                <p>Comanda: ${pedido.comandaId}</p>
                <p>Itens: ${pedido.itens ?? "Nenhum item informado"}</p>
                <p class="status">Status: ${pedido.status}</p>

                <button id="${pedido.id}_edit">Editar Pedido</button>
                <button id="${pedido.id}_delete">Excluir</button>
            </div>
        `);

        document.getElementById(`${pedido.id}_delete`)
            .addEventListener("click", () => removePedidoCozinha(pedido.id));

        document.getElementById(`${pedido.id}_edit`)
            .addEventListener("click", () => openEditModal(pedido));
    });
}

get();

// ------------------------------
// EDIT MODAL
// ------------------------------
function openEditModal(pedido) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <input type="number" value="${pedido.comandaId}" id="edit_comandaId"/>
                <input type="text" value="${pedido.status}" id="edit_status" placeholder="Status"/>
                <input type="text" value="${pedido.itens}" id="edit_itens" placeholder="Itens"/>

                <button id="update">Salvar</button>
            </div>
        </div>
    `);

    document.getElementById("update").addEventListener("click", async () => {
        const update = {
            comandaId: Number(document.getElementById("edit_comandaId").value),
            status: document.getElementById("edit_status").value,
            itens: document.getElementById("edit_itens").value
        };

        const response = await fetch(`${baseUrl}/api/PedidoCozinha/${pedido.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(update)
        });

        if (response.ok) location.reload();
    });
}

// ------------------------------
// DELETE PEDIDO
// ------------------------------
async function removePedidoCozinha(id) {
    await fetch(`${baseUrl}/api/PedidoCozinha/${id}`, {
        method: "DELETE"
    });

    location.reload();
}

// ------------------------------
// CREATE NEW PEDIDO
// ------------------------------
function openCreateModal() {
    document.getElementById("criar").addEventListener("click", () => {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <input type="number" id="comandaId" placeholder="Comanda ID"/>
                    <input type="text" id="status" placeholder="Status"/>
                    <input type="text" id="itens" placeholder="Itens"/>

<<<<<<< HEAD
                    <button id="create">Criar</button>
                </div>
            </div>
        `);

        getCardapioItens();

        async function getCardapioItens() {
            const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
            const cardapioitens = await res.json();
            const itensContainer = document.getElementById("itens");

            cardapioitens.forEach(item => {
                itensContainer.insertAdjacentHTML("beforeend", `
                    <li>
                        <label for="item-${item.id}">${item.titulo}</label>
                        <input type="checkbox" id="item-${item.id}" value="${item.id}" class="item-checkbox"/>
                    </li>
                `);
            });
        }

        const createButton = document.getElementById("create")


        document.getElementById("create").addEventListener("click", async () => {
            const novoPedido = {
                comandaId: Number(document.getElementById("comandaId").value),
                status: document.getElementById("status").value,
                itens: document.getElementById("itens").value
            };

            const response = await fetch(`${baseUrl}/api/PedidoCozinha`, {
                method: "POST",
                headers,
                body: JSON.stringify(novoPedido)
            });

            if (response.ok) location.reload();
        });
    });
}

openCreateModal();
