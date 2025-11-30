// ==========================
// CONFIG
// ==========================
const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

// modal elements
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPassword = document.getElementById("editPassword");

let editingUserId = null; // used by edit mode



// ==========================
// OPEN + CLOSE MODAL
// ==========================
function showModal() {
    modal.classList.remove("hidden"); // <-- THIS is the missing line causing all your pain
    modal.classList.add("show");
}
function closeModal() {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 200);
}

document.getElementById("cancelar").addEventListener("click", closeModal);



// ==========================
// LOAD USERS
// ==========================
async function get() {
    try {
        const res = await fetch(`${baseUrl}/api/Usuario`, { headers });
        const users = await res.json();

        const container = document.querySelector(".container");
        container.innerHTML = "";

        users.forEach(user => {
            const statusClass =
                user.status === "Ativo" ? "ativo" :
                user.status === "Inativo" ? "inativo" :
                "admin";

            // labels unchanged
            const buttonLabel =
                user.status === "Ativo" ? "Editar" :
                user.status === "Inativo" ? "Reativar" :
                "Gerenciar";

            const cardHTML = `
                <div class="usuario ${statusClass}">
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png">

                    <h2>${user.nome}</h2>

                    <p>Email:<br> ${user.email}</p>

                    <p class="status">Status: ${user.status}</p>

                    <button class="edit-btn" data-edit="${user.id}">${buttonLabel}</button>
                    <button class="delete-btn" data-delete="${user.id}">Excluir</button>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", cardHTML);
        });

        // delete buttons
        document.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", () => removeUsuario(btn.dataset.delete));
        });

        // EDIT / GERENCIAR buttons
        document.querySelectorAll("[data-edit]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.edit;
                const user = users.find(u => u.id === id);

                // Always open EDIT modal
                openEditModal(user);
            });
        });

    } catch (err) {
        console.error("Erro:", err);
    }
}

get();



// ==========================
// DELETE USER
// ==========================
async function removeUsuario(id) {
    if (!confirm("Deseja realmente deletar este usuário?")) return;

    const res = await fetch(`${baseUrl}/api/Usuario/${id}`, { method: "DELETE" });

    if (res.ok) {
        toastify("sucesso", "Usuário deletado.");
        get();
    } else {
        toastify("erro", "Erro ao deletar.");
    }
}



// ==========================
// CREATE USER
// ==========================
document.getElementById("criar").addEventListener("click", () => {
    editingUserId = null;

    modalTitle.textContent = "Criar Usuário";
    editName.value = "";
    editEmail.value = "";
    editPassword.value = "";

    showModal();
});



// ==========================
// EDIT USER
// ==========================
function openEditModal(user) {
    editingUserId = user.id;

    modalTitle.textContent = "Editar Usuário";
    editName.value = user.nome;
    editEmail.value = user.email;
    editPassword.value = "";

    showModal();
}



// ==========================
// SAVE (Create or Update)
// ==========================
document.getElementById("salvar").addEventListener("click", async () => {

    const payload = {
        nome: editName.value,
        email: editEmail.value,
        senha: editPassword.value
    };

    let res;

    if (editingUserId === null) {
        // CREATE
        res = await fetch(`${baseUrl}/api/Usuario`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });
    } else {
        // UPDATE
        res = await fetch(`${baseUrl}/api/Usuario/${editingUserId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        });
    }

    if (res.ok) {
        toastify("sucesso", editingUserId ? "Usuário atualizado!" : "Usuário criado!");
        closeModal();
        get();
    } else {
        toastify("erro", "Erro ao salvar.");
    }
});



// ==========================
// TOAST MESSAGE
// ==========================
function toastify(tipo, mensagem) {
    const id = "toast_" + Date.now();

    document.body.insertAdjacentHTML("beforeend", `
        <div id="${id}" class="toastify ${tipo}">
            <p>${mensagem}</p>
        </div>
    `);

    setTimeout(() => {
        document.getElementById(id)?.remove();
    }, 3000);
}
