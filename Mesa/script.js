const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

async function get() {
    const res = await fetch(`${baseUrl}/api/Mesa`, { headers });
    const mesas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = "";

    mesas.forEach(mesa => {
        let situacaoText = "Disponível";
        let cssClass = "disponivel";

        if (mesa.situacaoMesa === 1) { situacaoText = "Ocupada"; cssClass = "ocupada"; }
        if (mesa.situacaoMesa === 2) { situacaoText = "Reservada"; cssClass = "reservada"; }

        container.insertAdjacentHTML("beforeend", `
            <div class="mesa ${cssClass}">
                <p>Mesa #${mesa.numeroMesa}</p>
                <p>Status: ${situacaoText}</p>

                <button class="edit-btn" data-id="${mesa.id}">Editar Mesa</button>
                <button class="delete-btn" data-id="${mesa.id}">Deletar Mesa</button>
            </div>
        `);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        const mesa = mesas.find(m => m.id == btn.dataset.id);
        btn.onclick = () => openEditModal(mesa);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => removeMesa(btn.dataset.id);
    });
}

get();

/* ========================= */
/* POPUP - EDITAR */
/* ========================= */
function openEditModal(mesa) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Editar Mesa</h3>

                <input type="number" id="numeroMesa" value="${mesa.numeroMesa}">
                <input type="number" id="situacaoMesa" value="${mesa.situacaoMesa}">

                <button id="saveEdit">Salvar</button>
                <button id="closeModal">Cancelar</button>
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

/* ========================= */
/* DELETAR */
/* ========================= */
async function removeMesa(id) {
    const response = await fetch(`${baseUrl}/api/Mesa/${id}`, { method: "DELETE" });
    if (response.ok) get();
}

/* ========================= */
/* POPUP - CRIAR MESA */
/* ========================= */
document.getElementById("criar").addEventListener("click", () => {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Criar Mesa</h3>

                <input type="number" id="newNumeroMesa" placeholder="Número da mesa">
                <input type="number" id="newSituacaoMesa" placeholder="Status (0,1,2)">

                <button id="createBtn">Salvar</button>
                <button id="closeModal">Cancelar</button>
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

function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}
