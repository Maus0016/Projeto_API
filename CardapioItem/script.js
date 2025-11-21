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
                <p><strong>${item.titulo}</strong></p>
                <p>${item.descricao}</p>
                <p>Preço: R$ ${Number(item.preco).toFixed(2)}</p>
                <p>Possui Preparo: ${preparo}</p>

                <button id="${item.id}_delete">Excluir</button>
                <button id="${item.id}_edit">Editar</button>
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
                <input type="text" value="${item.titulo}" id="titulo"/>
                <input type="text" value="${item.descricao}" id="descricao"/>
                <input type="number" step="0.01" value="${item.preco}" id="preco"/>

                <label>
                    Possui Preparo:
                    <input type="checkbox" id="edit_preparo" ${item.possuiPreparo ? "checked" : ""}/>
                </label>

                <button id="update">Salvar</button>
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
                    <input type="text" id="titulo" placeholder="Título"/>
                    <input type="text" id="descricao" placeholder="Descrição"/>
                    <input type="number" step="0.01" id="preco" placeholder="Preço"/>

                    <label>
                        Possui Preparo:
                        <input type="checkbox" id="possuiPreparo"/>
                    </label>

                    <button id="create">Salvar</button>
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
    });
}

openCreateModal();
