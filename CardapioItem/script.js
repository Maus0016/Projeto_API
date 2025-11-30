const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

// ==================== GET ITEMS ====================
async function get() {
    const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
    const cardapioItems = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // remove static items

    cardapioItems.forEach(item => {
        const preparo = item.possuiPreparo ? "Sim" : "Não";

        container.insertAdjacentHTML("beforeend", `
            <div class="cardapioitem">
                <div class="info-container">
                    <strong>Título</strong>
                    <p>${item.titulo}</p>
                </div>
                <div class="info-container">
                    <strong>Descrição</strong>
                    <p>${item.descricao}</p>
                </div>
                <div class="info-container">
                    <strong>Preço</strong>
                    <p>R$ ${Number(item.preco).toFixed(2)}</p>
                </div>
                <div class="info-container">
                    <strong>Possui Preparo</strong>
                    <p>${preparo}</p>
                </div>

                <div class="button-container">
                    <button id="${item.id}_delete">Excluir</button>
                    <button id="${item.id}_edit">Editar</button>
                </div>
            </div>
        `);

        document.getElementById(`${item.id}_delete`)
            .addEventListener("click", () => removeCardapioitem(item.id));

        document.getElementById(`${item.id}_edit`)
            .addEventListener("click", () => openEditModal(item));
    });
}

get();

// ==================== EDIT MODAL ====================
function openEditModal(item) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <div class="input-container">
                    <label for="titulo">Título</label>
                    <input type="text" value="${item.titulo}" id="titulo"/>
                </div>
                <div class="input-container">
                    <label for="descricao">Descrição</label>
                    <input type="text" value="${item.descricao}" id="descricao"/>
                </div>
                <div class="input-container">
                    <label for="preco">Preço</label>
                    <input type="number" step="0.01" value="${item.preco}" id="preco"/>
                </div>
                <div class="input-container">
                    <label>
                        <input type="checkbox" id="edit_preparo" ${item.possuiPreparo ? "checked" : ""}/>
                        Possui Preparo
                    </label>
                </div>

                <div class="button-container">
                    <button id="update">Salvar</button>
                    <button id="cancelEdit">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("update").addEventListener("click", async () => {
        const updateData = {
            titulo: document.getElementById("titulo").value,
            descricao: document.getElementById("descricao").value,
            preco: Number(document.getElementById("preco").value),
            possuiPreparo: document.getElementById("edit_preparo").checked
        };

        const response = await fetch(`${baseUrl}/api/CardapioItem/${item.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            location.reload();
        }
    });

    // Cancel button functionality for edit modal
    document.getElementById("cancelEdit").addEventListener("click", () => {
        document.querySelector('.wrapper').remove();
    });
}

// ==================== DELETE ====================
async function removeCardapioitem(id) {
    const response = await fetch(`${baseUrl}/api/CardapioItem/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        location.reload();
    }
}

// ==================== CREATE ====================
function openCreateModal() {
    const button = document.getElementById("criar");

    button.addEventListener("click", () => {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <div class="input-container">
                        <label for="titulo">Título</label>
                        <input type="text" id="titulo" placeholder="Título"/>
                    </div>
                    <div class="input-container">
                        <label for="descricao">Descrição</label>
                        <input type="text" id="descricao" placeholder="Descrição"/>
                    </div>
                    <div class="input-container">
                        <label for="preco">Preço</label>
                        <input type="number" step="0.01" id="preco" placeholder="Preço"/>
                    </div>
                    <div class="input-container">
                        <label>
                            <input type="checkbox" id="possuiPreparo"/>
                            Possui Preparo
                        </label>
                    </div>

                    <div class="button-container">
                        <button id="create">Salvar</button>
                        <button id="cancelCreate">Cancelar</button>
                    </div>
                </div>
            </div>
        `);

        document.getElementById("create").addEventListener("click", async () => {
            const cardapioItem = {
                titulo: document.getElementById("titulo").value,
                descricao: document.getElementById("descricao").value,
                preco: Number(document.getElementById("preco").value),
                possuiPreparo: document.getElementById("possuiPreparo").checked
            };

            const response = await fetch(`${baseUrl}/api/CardapioItem`, {
                method: "POST",
                headers,
                body: JSON.stringify(cardapioItem)
            });

            if (response.ok) {
                location.reload();
            }
        });

        // Cancel button functionality for create modal
        document.getElementById("cancelCreate").addEventListener("click", () => {
            document.querySelector('.wrapper').remove();
        });
    });
}

openCreateModal();