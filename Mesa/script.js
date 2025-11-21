const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

async function get() {
    const res = await fetch(`${baseUrl}/api/Mesa`, { headers });
    const mesas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // Clear first for clean render

    mesas.forEach(mesa => {
        // convert number → string
        let situacaoText = "Disponível";
        let cssClass = "disponivel";

        if (mesa.situacaoMesa === 1) {
            situacaoText = "Ocupada";
            cssClass = "ocupada";
        } else if (mesa.situacaoMesa === 2) {
            situacaoText = "Reservada";
            cssClass = "reservada";
        }

        container.insertAdjacentHTML(
            "beforeend",
            `
        <div class="mesa ${cssClass}">
            <p>Mesa #${mesa.numeroMesa}</p>
            <p>Status: ${situacaoText}</p>

            <button class="edit-btn" data-id="${mesa.id}">Editar Mesa</button>
            <button class="delete-btn" data-id="${mesa.id}">Deletar Mesa</button>
        </div>
        `
        );
    });

    // add listeners AFTER inserting HTML
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => removeMesa(btn.dataset.id));
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        const mesa = mesas.find(x => x.id == btn.dataset.id);
        btn.addEventListener("click", () => openEditModal(mesa));
    });
}

get();
