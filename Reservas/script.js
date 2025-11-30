const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

// ---------------------------
//  LOAD RESERVAS
// ---------------------------
async function get() {
    const res = await fetch(`${baseUrl}/api/Reservas`, { headers });
    const reservas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; 

    reservas.forEach(r => {
        container.insertAdjacentHTML("beforeend", `
            <div class="reserva pendente">
                <h2>Reserva #${r.id}</h2>
                <p>Mesa: ${r.numeroMesa}</p>
                <p>Cliente: ${r.nomeCliente}</p>
                <p>Telefone: ${r.telefone}</p>

                <p class="status">Status: Pendente</p>

                <button class="edit-btn" data-id="${r.id}">Editar Reserva</button>
                <button class="delete-btn" data-id="${r.id}">Cancelar Reserva</button>
            </div>
        `);
    });

    // DELETE buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => removeReserva(btn.dataset.id));
    });

    // EDIT buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
        const reserva = reservas.find(x => x.id == btn.dataset.id);
        btn.addEventListener("click", () => openEditModal(reserva));
    });
}

get();

// ------------------------------------------------
//  UNIVERSAL MODAL CONTROLS
// ------------------------------------------------
const modal = document.getElementById("modalReserva");
const closeBtns = document.querySelectorAll(".closeModal");

closeBtns.forEach(btn =>
    btn.addEventListener("click", () => {
        modal.classList.add("hidden");
    })
);

document.getElementById("criarReserva").addEventListener("click", () => {
    resetModalFields();
    modal.dataset.mode = "create";
    modal.classList.remove("hidden");
});

function openEditModal(r) {
    document.getElementById("reservaCliente").value = r.nomeCliente;
    document.getElementById("reservaData").value = r.data || "";
    document.getElementById("reservaDescricao").value = r.descricao || "";

    modal.dataset.mode = "edit";
    modal.dataset.id = r.id;

    modal.classList.remove("hidden");
}


// ------------------------------------------------
//  SAVE (CREATE OR EDIT)
// ------------------------------------------------
document.getElementById("salvarReserva").addEventListener("click", async () => {
    const payload = {
        nomeCliente: document.getElementById("reservaCliente").value,
        data: document.getElementById("reservaData").value,
        descricao: document.getElementById("reservaDescricao").value
    };

    if (modal.dataset.mode === "create") {
        await fetch(`${baseUrl}/api/Reservas`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });
    }

    if (modal.dataset.mode === "edit") {
        const id = modal.dataset.id;
        await fetch(`${baseUrl}/api/Reservas/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        });
    }

    modal.classList.add("hidden");
    get();
});

// ------------------------------------------------
//  DELETE
// ------------------------------------------------
async function removeReserva(id) {
    await fetch(`${baseUrl}/api/Reservas/${id}`, { method: "DELETE" });
    get();
}

// ------------------------------------------------
//  RESET FIELDS
// ------------------------------------------------
function resetModalFields() {
    document.getElementById("reservaCliente").value = "";
    document.getElementById("reservaData").value = "";
    document.getElementById("reservaDescricao").value = "";
}
