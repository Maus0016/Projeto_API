const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

// ==================== GET PEDIDOS COZINHA ====================
async function get() {
    const res = await fetch(`${baseUrl}/api/PedidoCozinha`, { headers });
    const pedidos = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; 

    pedidos.forEach(pedido => {
        let statusClass = "status-pendente";
        if (pedido.status === "Preparo") statusClass = "status-preparo";
        if (pedido.status === "Pronto") statusClass = "status-pronto";

        container.insertAdjacentHTML("beforeend", `
            <div class="pedido">
                <div class="info-container">
                    <strong>Número do Pedido</strong>
                    <p>#${pedido.id}</p>
                </div>
                <div class="info-container">
                    <strong>ID da Comanda</strong>
                    <p>${pedido.comandaId}</p>
                </div>
                <div class="info-container">
                    <strong>Itens do Pedido</strong>
                    <p>${pedido.itens ?? "Nenhum item informado"}</p>
                </div>
                <div class="status-container">
                    <strong>Status</strong>
                    <p class="${statusClass}">${pedido.status}</p>
                </div>

                <div class="button-container">
                    <button class="edit-btn" data-id="${pedido.id}">Editar</button>
                    <button class="delete-btn" data-id="${pedido.id}">Excluir</button>
                </div>
            </div>
        `);
    });

    // Attach event listeners AFTER creating all elements
    attachEventListeners(pedidos);
}

// ==================== ATTACH EVENT LISTENERS ====================
function attachEventListeners(pedidos) {
    // Edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const selected = pedidos.find(p => p.id == id);
            if (selected) {
                openEditModal(selected);
            }
        });
    });

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            if (id) {
                removePedidoCozinha(id);
            }
        });
    });
}

get();

// ==================== EDIT MODAL ====================
let editingPedido = null;

function openEditModal(pedido) {
    editingPedido = pedido;

    // Create modal if it doesn't exist
    if (!document.getElementById("popup-overlay")) {
        createModal();
    }

    // Populate form with current data
    document.getElementById("edit-comandaId").value = pedido.comandaId;
    document.getElementById("edit-itens").value = pedido.itens ?? "";
    document.getElementById("edit-status").value = pedido.status;
    document.getElementById("modal-title").textContent = "Editar Pedido";

    // Show modal
    document.getElementById("popup-overlay").classList.remove("hidden");
}

// ==================== CREATE MODAL ====================
function createModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById("popup-overlay");
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="popup-overlay hidden" id="popup-overlay">
            <div class="popup-box">
                <h2 id="modal-title">Editar Pedido</h2>

                <div class="input-container">
                    <label for="edit-comandaId">ID da Comanda</label>
                    <input type="number" id="edit-comandaId" placeholder="Digite o ID da comanda" min="1">
                </div>

                <div class="input-container">
                    <label for="edit-itens">Itens do Pedido</label>
                    <input type="text" id="edit-itens" placeholder="Digite os itens do pedido">
                </div>

                <div class="input-container">
                    <label for="edit-status">Status do Pedido</label>
                    <select id="edit-status">
                        <option value="Pendente">Pendente</option>
                        <option value="Preparo">Em Preparo</option>
                        <option value="Pronto">Pronto</option>
                    </select>
                </div>

                <div class="modal-buttons">
                    <button id="save-btn">Salvar</button>
                    <button id="cancel-btn" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add event listeners
    document.getElementById("cancel-btn").addEventListener("click", () => {
        document.getElementById("popup-overlay").classList.add("hidden");
    });

    document.getElementById("save-btn").addEventListener("click", handleSave);
}

// ==================== HANDLE SAVE ====================
async function handleSave() {
    const comandaId = Number(document.getElementById("edit-comandaId").value);
    const itens = document.getElementById("edit-itens").value;
    const status = document.getElementById("edit-status").value;

    if (!comandaId) {
        alert("Por favor, insira um ID da comanda válido!");
        return;
    }

    try {
        if (editingPedido) {
            // Update existing pedido
            const update = {
                comandaId: comandaId,
                itens: itens,
                status: status
            };

            const response = await fetch(`${baseUrl}/api/PedidoCozinha/${editingPedido.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(update)
            });

            if (response.ok) {
                document.getElementById("popup-overlay").classList.add("hidden");
                get();
            } else {
                alert("Erro ao atualizar pedido!");
            }
        } else {
            // Create new pedido
            const novoPedido = {
                comandaId: comandaId,
                itens: itens,
                status: status
            };

            const response = await fetch(`${baseUrl}/api/PedidoCozinha`, {
                method: "POST",
                headers,
                body: JSON.stringify(novoPedido)
            });

            if (response.ok) {
                document.getElementById("popup-overlay").classList.add("hidden");
                get();
            } else {
                alert("Erro ao criar pedido!");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Erro de conexão!");
    }
}

// ==================== DELETE PEDIDO ====================
async function removePedidoCozinha(id) {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
        try {
            const response = await fetch(`${baseUrl}/api/PedidoCozinha/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                get();
            } else {
                alert("Erro ao excluir pedido!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Erro de conexão!");
        }
    }
}

// ==================== CREATE NEW PEDIDO ====================
function initCreateButton() {
    // Create button if it doesn't exist in HTML
    let createButton = document.getElementById("criar");
    if (!createButton) {
        createButton = document.createElement("button");
        createButton.id = "criar";
        createButton.textContent = "Criar Pedido";
        document.querySelector("h1").insertAdjacentElement("afterend", createButton);
    }

    // Remove existing event listeners and add new one
    createButton.replaceWith(createButton.cloneNode(true));
    document.getElementById("criar").addEventListener("click", () => {
        editingPedido = null;

        // Create modal if it doesn't exist
        if (!document.getElementById("popup-overlay")) {
            createModal();
        }

        // Clear form and set default values
        document.getElementById("modal-title").textContent = "Criar Pedido";
        document.getElementById("edit-comandaId").value = "";
        document.getElementById("edit-itens").value = "";
        document.getElementById("edit-status").value = "Pendente";

        // Show modal
        document.getElementById("popup-overlay").classList.remove("hidden");
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initCreateButton();
    get();
});