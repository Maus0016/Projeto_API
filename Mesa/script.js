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

function openEditModal(comanda) {
    closeModals();
    console.log(comanda, "comanda to edit");
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Editar Comanda</h3>
                <input type="number" value="${comanda.numeroMesa}" id="numeroMesa">
                <input type="text" value="${comanda.situacaoMesa}" id="nomeCliente">

                <button id="saveEdit">Salvar</button>
                <button id="closeModal">Cancelar</button>
            </div>
        </div>
    `);

    document.getElementById("closeModal").onclick = closeModals;

    document.getElementById("saveEdit").onclick = async () => {
        const objMesaUpdate = {
            numeroMesa: Number(document.getElementById("numeroMesa").value),
            situacaoMesa: document.getElementById("situacaoMesa")
        };

        const response = await fetch(`${baseUrl}/api/Mesa/${comanda.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(objMesaUpdate)
        });

        if (response.ok) {
            closeModals();
            get();
        }
    };
}

// =========================
// DELETE
// =========================
async function removeComanda(id) {
    const response = await fetch(`${baseUrl}/api/Comanda/${id}`, {
        method: "DELETE"
    });

    if (response.ok) get();
}

// =========================
// CRIAR COMANDA
// =========================
function openCreateModal() {
    const button = document.querySelector("#criar");
    console.log(button, "botao criar");
    button.addEventListener("click", () => {
        closeModals();

        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h3>Criar Comanda</h3>
                    <ul id="itens">
                    </ul>
                    <input type="number" placeholder="Número da mesa" id="numeroMesa">
                    <input type="text" placeholder="Status da Mesa" id="situacaoMesa">
                    <input type="text" placeholder="Itens" id="comandaItens" id="itens[]"/>
                    <label for="itens">Itens (separados por vírgula)</label>
                    

                    <button id="createBtn">Salvar</button>
                    <button id="closeModal">Cancelar</button>
                </div>
            </div>
        `);
        const createButton = document.getElementById("createBtn")

        createButton.addEventListener("click", async () => {

            const mesa = {

            }
            const response = await fetch(`${baseUrl}/api/Mesa`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(mesa)
                })

            console.log(response, "response edit")
            if (response.ok) {

                //location.reload()
            }
        })


    });

    //document.getElementById("closeModal").onclick = closeModals;

    // document.getElementById("createBtn").onclick = async () => {
    //     // const selectedItems = Array.from(document.querySelectorAll(".item-checkbox:checked")).map(cb => Number(cb.value));
    //     const itensSelecionados = [];
    //     const check = document.querySelectorAll(".item-checkbox");
    //     check.forEach(item => {
    //         if (item.checked) {
    //             itensSelecionados.push(Number(item.value));
    //         }
    //     })
    //     console.log(itensSelecionados, "itens selecionados");
    //     const mesas = {
    //         numeroMesa: Number(document.getElementById("numeroMesa").value),
    //         nomeCliente: document.getElementById("nomeCliente").value,
    //         cardapioItemIds: itensSelecionados
    //     };

    //     const response = await fetch(`${baseUrl}/api/Mesa`, {
    //         method: "POST",
    //         headers,
    //         body: JSON.stringify(mesas)
    //     });

    //     if (response.ok) {
    //         closeModals();
    //         get();
    //     };
    // };
}
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}
openCreateModal()





