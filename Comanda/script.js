const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

// =========================
// GET (LISTAR COMANDAS)
// =========================
async function get() {
    const res = await fetch(`${baseUrl}/api/Comanda`, { headers });
    const comandas = await res.json();

    const container = document.querySelector(".container");
    container.innerHTML = ""; // clear old cards

    comandas.forEach(comanda => {
        container.insertAdjacentHTML("beforeend", `
            <div class="comanda">
                <p><strong>ID:</strong> ${comanda.id}</p>
                <p><strong>Mesa:</strong> ${comanda.numeroMesa}</p>
                <p><strong>Cliente:</strong> ${comanda.nomeCliente}</p>
                <p><strong>Itens:</strong> ${Array.isArray(comanda.items) ? comanda.items.length : 0}</p>

                <button class="edit-btn" data-id="${comanda.id}">Editar</button>
                <button class="delete-btn" data-id="${comanda.id}">Excluir</button>
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

// =========================
// MODAL PARA EDITAR
// =========================
function openEditModal(comanda) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3>Editar Comanda</h3>
                <input type="number" value="${comanda.numeroMesa}" id="numeroMesa">
                <input type="text" value="${comanda.nomeCliente}" id="nomeCliente">

                <button id="saveEdit">Salvar</button>
                <button id="closeModal">Cancelar</button>
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

    button.addEventListener("click", () => {
        closeModals();

        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h3>Criar Comanda</h3>
                    <ul id="itens">
                    </ul>
                    <input type="number" placeholder="Número da mesa" id="numeroMesa">
                    <input type="text" placeholder="Nome do cliente" id="nomeCliente">
                    <input type="text" placeholder="Itens" id="comandaItens" id="itens[]"/>
                    <label for="itens">Itens (separados por vírgula)</label>
                    

                    <button id="createBtn">Salvar</button>
                    <button id="closeModal">Cancelar</button>
                </div>
            </div>
        `);
        getCardapioItens();

        async function getCardapioItens() {
            const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
            const cardapioitens = await res.json();
            const itensContainer = document.getElementById("itens");

            cardapioitens.forEach(item => {
                itensContainer.insertAdjacentHTML("beforeend", `
                    <li>
                        <label for="item-${item.id}">${item.nome}</label>
                        <input type="checkbox" id="item-${item.id}" value="${item.id}" class="item-checkbox"/>
                    </li>
                `);
            });
            //cardaoioitebs chama
            //=[]
            //get cardapioitens from api/cardapioitens
            //foreach item in array 
            //itens
            //<label>${item.nome}<label/>
            //<inout class="check" id="caitem" type="chcekbox"/> 

            document.getElementById("closeModal").onclick = closeModals;

            document.getElementById("createBtn").onclick = async () => {
                // const selectedItems = Array.from(document.querySelectorAll(".item-checkbox:checked")).map(cb => Number(cb.value));
                const itensSelecionados = [];
                const check = document.querySelectorAll(".item-checkbox");
                check.forEach(item => {
                    if (item.checked) {
                        itensSelecionados.push(Number(item.value));
                    }
                })
                console.log(itensSelecionados, "itens selecionados");
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


    })
}
openCreateModal();

// =========================
// FECHAR MODAIS
// =========================
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}
