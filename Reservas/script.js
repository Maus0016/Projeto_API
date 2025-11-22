const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

async function get() {
    const res = await fetch(`${baseUrl}/api/Reservas`, { headers });
    const reservas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // clear old items

    reservas.forEach(r => {
        container.insertAdjacentHTML("beforeend", `
            <div class="reserva pendente">
                <h2>Reserva #${r.id}</h2>
                <p>Mesa: ${r.numeroMesa}</p>
                <p>Cliente: ${r.nomeCliente}</p>
                <p>Telefone: ${r.telefone}</p>

                <p class="status">Status: Pendente</p>

                <button id="${r.id}_edit">Editar Reserva</button>
                <button id="${r.id}">Cancelar Reserva</button>
            </div>
        `);

        // Delete
        document.getElementById(r.id).addEventListener("click", () => {
            removeReserva(r.id);
        });

        // Edit
        document.getElementById(`${r.id}_edit`).addEventListener("click", () => {
            openEditModal(r);
        });
    });
}

get();

function openEditModal(r) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <input type="text" value="${r.numeroMesa}" id="numeroMesa"/>
                <input type="text" value="${r.nomeCliente}" id="nomeCliente"/>
                <input type="text" value="${r.telefone}" id="telefone"/>
                <button id="saveEdit">Salvar</button>
            </div>
        </div>
    `);

    document.getElementById("saveEdit").addEventListener("click", async () => {
        const updated = {
            id: r.id,
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            nomeCliente: document.getElementById("nomeCliente").value,
            telefone: Number(document.getElementById("telefone").value)
        };

        await fetch(`${baseUrl}/api/Reserva/${r.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updated)
        });

        location.reload();
    });
}

async function removeReserva(id) {
    await fetch(`${baseUrl}/api/Reservas/${id}`, { method: "DELETE" });
    location.reload();
}

function openCreateModal() {
    const button = document.querySelector("#criar");
    button.addEventListener("click", () => {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <input type="text" id="numeroMesa" placeholder="Mesa"/>
                    <input type="text" id="nomeCliente" placeholder="Cliente"/>
                    <input type="text" id="telefone" placeholder="Telefone"/>
                    <button id="saveCreate">Salvar</button>
                </div>
            </div>
        `);

        document.getElementById("saveCreate").addEventListener("click", async () => {
            const novaReserva = {
                numeroMesa: Number(document.getElementById("numeroMesa").value),
                nomeCliente: document.getElementById("nomeCliente").value,
                telefone: Number(document.getElementById("telefone").value)
            };

            await fetch(`${baseUrl}/api/Reservas`, {
                method: "POST",
                headers,
                body: JSON.stringify(novaReserva)
            });

            location.reload();
        });
    });
}

openCreateModal();
