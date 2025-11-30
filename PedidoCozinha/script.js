const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

// ------------------------------
// LOAD ALL PEDIDOS DA COZINHA
// ------------------------------
async function get() {
    const res = await fetch(`${baseUrl}/api/PedidoCozinha`, { headers });
    const pedidos = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; 

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

// =======================================================
// EDIT POPUP (GLASS POPUP)
// =======================================================
let editingPedido = null;

function openEditModal(pedido) {
    editingPedido = pedido;

    document.getElementById("edit-nome").value = pedido.itens ?? "";
    document.getElementById("edit-qtd").value = pedido.comandaId;

    document.getElementById("popup-overlay").classList.remove("hidden");
}

// close popup
document.getElementById("cancel-btn").addEventListener("click", () => {
    document.getElementById("popup-overlay").classList.add("hidden");
});

// save edit
document.getElementById("save-btn").addEventListener("click", async () => {
    const update = {
        comandaId: Number(document.getElementById("edit-qtd").value),
        itens: document.getElementById("edit-nome").value,
        status: editingPedido.status
    };

    const response = await fetch(`${baseUrl}/api/PedidoCozinha/${editingPedido.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(update)
    });

    if (response.ok) {
        document.getElementById("popup-overlay").classList.add("hidden");
        get();
    }
});

// ------------------------------
// DELETE PEDIDO
// ------------------------------
async function removePedidoCozinha(id) {
    await fetch(`${baseUrl}/api/PedidoCozinha/${id}`, {
        method: "DELETE"
    });

    get();
}

// =======================================================
// CREATE NEW PEDIDO (USING SAME GLASS POPUP SYSTEM)
// =======================================================
function openCreateModal() {
    document.getElementById("criar").addEventListener("click", () => {
        
        editingPedido = null;

        // clear popup inputs for create mode
        document.getElementById("edit-nome").value = "";
        document.getElementById("edit-qtd").value = "";

        document.getElementById("popup-overlay").classList.remove("hidden");

        // override save button behavior temporarily
        document.getElementById("save-btn").onclick = async () => {
            const novoPedido = {
                comandaId: Number(document.getElementById("edit-qtd").value),
                itens: document.getElementById("edit-nome").value,
                status: "Pendente"
            };

            const response = await fetch(`${baseUrl}/api/PedidoCozinha`, {
                method: "POST",
                headers,
                body: JSON.stringify(novoPedido)
            });

            if (response.ok) {
                document.getElementById("popup-overlay").classList.add("hidden");
                get();
            }
        };
    });
}

openCreateModal();
        