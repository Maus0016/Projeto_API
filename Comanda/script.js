const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

// ==================== GET COMANDAS ====================
async function get() {
    const res = await fetch(`${baseUrl}/api/Comanda`, { headers });
    const comandas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // clear old cards

    comandas.forEach(comanda => {
        container.insertAdjacentHTML("beforeend", `
            <div class="comanda">
                <div class="info-container">
                    <strong>ID da Comanda</strong>
                    <p>${comanda.id}</p>
                </div>
                <div class="info-container">
                    <strong>Número da Mesa</strong>
                    <p>${comanda.numeroMesa}</p>
                </div>
                <div class="info-container">
                    <strong>Nome do Cliente</strong>
                    <p>${comanda.nomeCliente}</p>
                </div>
                <div class="info-container">
                    <strong>Quantidade de Itens</strong>
                    <p>${Array.isArray(comanda.items) ? comanda.items.length : 0}</p>
                </div>

                <div class="button-container">
                    <button class="edit-btn" data-id="${comanda.id}">Editar</button>
                    <button class="delete-btn" data-id="${comanda.id}">Excluir</button>
                </div>
            </div>
        `);
    });

    // Attach edit/delete events
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const selected = comandas.find(c => c.id == id);
            openEditModal(selected);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            removeComanda(btn.getAttribute("data-id"));
        });
    });
}

get();

// ==================== EDIT MODAL ====================
function openEditModal(comanda) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Editar Comanda</h3>

                <div class="input-container">
                    <label for="numeroMesa">Número da Mesa</label>
                    <input type="number" value="${comanda.numeroMesa}" id="numeroMesa" min="1">
                </div>

                <div class="input-container">
                    <label for="nomeCliente">Nome do Cliente</label>
                    <input type="text" value="${comanda.nomeCliente}" id="nomeCliente">
                </div>

                <div class="modal-buttons">
                    <button id="saveEdit">Salvar</button>
                    <button id="closeModal" class="cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("closeModal").onclick = closeModals;

    document.getElementById("saveEdit").onclick = async () => {
        const objComandaUpdate = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            nomeCliente: document.getElementById("nomeCliente").value
        };

        const response = await fetch(`${baseUrl}/api/Comanda/${comanda.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(objComandaUpdate)
        });

        if (response.ok) {
            closeModals();
            get();
        }
    };
}

// ==================== DELETE COMANDA ====================
async function removeComanda(id) {
    if (confirm("Tem certeza que deseja excluir esta comanda?")) {
        const response = await fetch(`${baseUrl}/api/Comanda/${id}`, {
            method: "DELETE"
        });

        if (response.ok) get();
    }
}

// ==================== CREATE COMANDA ====================
function openCreateModal() {
    const button = document.querySelector("#criar");

    button.addEventListener("click", () => {
        closeModals();

        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h3>Criar Comanda</h3>

                    <div class="input-container">
                        <label for="numeroMesa">Número da Mesa</label>
                        <input type="number" placeholder="Digite o número da mesa" id="numeroMesa" min="1">
                    </div>

                    <div class="input-container">
                        <label for="nomeCliente">Nome do Cliente</label>
                        <input type="text" placeholder="Digite o nome do cliente" id="nomeCliente">
                    </div>

                    <div class="checklist-container">
                        <label>Itens do Cardápio</label>
                        <div class="checklist" id="itens-checklist">
                            <!-- Itens will be populated by JavaScript -->
                        </div>
                    </div>

                    <div class="modal-buttons">
                        <button id="createBtn">Salvar</button>
                        <button id="closeModal" class="cancel">Cancelar</button>
                    </div>
                </div>
            </div>
        `);

        getCardapioItens();
    });
}

// ==================== GET CARDAPIO ITENS FOR CHECKLIST ====================
async function getCardapioItens() {
    const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
    const cardapioitens = await res.json();
    const itensContainer = document.getElementById("itens-checklist");

    cardapioitens.forEach(item => {
        itensContainer.insertAdjacentHTML("beforeend", `
            <div class="checklist-item">
                <input type="checkbox" id="item-${item.id}" value="${item.id}" class="item-checkbox">
                <label for="item-${item.id}">${item.titulo} - R$ ${Number(item.preco).toFixed(2)}</label>
            </div>
        `);
    });

    document.getElementById("closeModal").onclick = closeModals;

    document.getElementById("createBtn").onclick = async () => {
        const itensSelecionados = [];
        const checkboxes = document.querySelectorAll(".item-checkbox:checked");
        
        checkboxes.forEach(checkbox => {
            itensSelecionados.push(Number(checkbox.value));
        });

        console.log("Itens selecionados:", itensSelecionados);

        const Comanda = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            nomeCliente: document.getElementById("nomeCliente").value,
            cardapioItemIds: itensSelecionados
        };

        const response = await fetch(`${baseUrl}/api/Comanda`, {
            method: "POST",
            headers,
            body: JSON.stringify(Comanda)
        });

        if (response.ok) {
            closeModals();
            get();
        }
    };
}

openCreateModal();

// ==================== CLOSE MODALS ====================
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}