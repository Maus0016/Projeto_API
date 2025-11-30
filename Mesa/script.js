const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

// ==================== GET MESAS ====================
async function get() {
    const res = await fetch(`${baseUrl}/api/Mesa`, { headers });
    const mesas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = "";

    mesas.forEach(mesa => {
        let situacaoText = "Disponível";
        let statusClass = "status-disponivel";

        if (mesa.situacaoMesa === 1) { 
            situacaoText = "Ocupada"; 
            statusClass = "status-ocupada"; 
        }
        if (mesa.situacaoMesa === 2) { 
            situacaoText = "Reservada"; 
            statusClass = "status-reservada"; 
        }

        container.insertAdjacentHTML("beforeend", `
            <div class="mesa">
                <div class="info-container">
                    <strong>Número da Mesa</strong>
                    <p>#${mesa.numeroMesa}</p>
                </div>
                <div class="info-container">
                    <strong>Status</strong>
                    <p class="${statusClass}">${situacaoText}</p>
                </div>

                <div class="button-container">
                    <button class="edit-btn" data-id="${mesa.id}">Editar</button>
                    <button class="delete-btn" data-id="${mesa.id}">Excluir</button>
                </div>
            </div>
        `);
    });

    // Add event listeners
    document.querySelectorAll(".edit-btn").forEach(btn => {
        const mesa = mesas.find(m => m.id == btn.dataset.id);
        btn.onclick = () => openEditModal(mesa);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => removeMesa(btn.dataset.id);
    });
}

get();

// ==================== EDIT MODAL ====================
function openEditModal(mesa) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Editar Mesa</h3>

                <div class="input-container">
                    <label for="numeroMesa">Número da Mesa</label>
                    <input type="number" id="numeroMesa" value="${mesa.numeroMesa}" min="1">
                </div>

                <div class="input-container">
                    <label for="situacaoMesa">Situação</label>
                    <select id="situacaoMesa">
                        <option value="0" ${mesa.situacaoMesa === 0 ? 'selected' : ''}>Disponível</option>
                        <option value="1" ${mesa.situacaoMesa === 1 ? 'selected' : ''}>Ocupada</option>
                        <option value="2" ${mesa.situacaoMesa === 2 ? 'selected' : ''}>Reservada</option>
                    </select>
                </div>

                <div class="modal-buttons">
                    <button id="saveEdit">Salvar</button>
                    <button id="closeModal">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("closeModal").onclick = closeModals;

    document.getElementById("saveEdit").onclick = async () => {
        const update = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            situacaoMesa: Number(document.getElementById("situacaoMesa").value)
        };

        const response = await fetch(`${baseUrl}/api/Mesa/${mesa.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(update)
        });

        if (response.ok) {
            closeModals();
            get();
        }
    };
}

// ==================== DELETE MESA ====================
async function removeMesa(id) {
    if (confirm("Tem certeza que deseja excluir esta mesa?")) {
        const response = await fetch(`${baseUrl}/api/Mesa/${id}`, { 
            method: "DELETE" 
        });
        if (response.ok) get();
    }
}

// ==================== CREATE MESA ====================
document.getElementById("criar").addEventListener("click", () => {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Criar Mesa</h3>

                <div class="input-container">
                    <label for="newNumeroMesa">Número da Mesa</label>
                    <input type="number" id="newNumeroMesa" placeholder="Digite o número" min="1">
                </div>

                <div class="input-container">
                    <label for="newSituacaoMesa">Situação Inicial</label>
                    <select id="newSituacaoMesa">
                        <option value="0">Disponível</option>
                        <option value="1">Ocupada</option>
                        <option value="2">Reservada</option>
                    </select>
                </div>

                <div class="modal-buttons">
                    <button id="createBtn">Salvar</button>
                    <button id="closeModal">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("closeModal").onclick = closeModals;

    document.getElementById("createBtn").onclick = async () => {
        const mesa = {
            numeroMesa: Number(document.getElementById("newNumeroMesa").value),
            situacaoMesa: Number(document.getElementById("newSituacaoMesa").value)
        };

        const response = await fetch(`${baseUrl}/api/Mesa`, {
            method: "POST",
            headers,
            body: JSON.stringify(mesa)
        });

        if (response.ok) {
            closeModals();
            get();
        }
    };
});

// ==================== CLOSE MODALS ====================
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}