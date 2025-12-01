// ==========================
// CONFIG
// ==========================
const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

let editingUserId = null;

// ==========================
// INITIALIZE APP
// ==========================
document.addEventListener('DOMContentLoaded', function() {
    initializeModal();
    initializeCreateButton();
    initializeSaveButton();
    get(); // Load users
});

// ==========================
// MODAL MANAGEMENT
// ==========================
function initializeModal() {
    const modal = document.getElementById("modal");
    const cancelarBtn = document.getElementById("cancelar");
    
    // Ensure modal starts hidden
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    
    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", closeModal);
    }
}

function showModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add("show"), 10);
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}

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
                user.status === "Ativo" ? "status-ativo" :
                user.status === "Inativo" ? "status-inativo" :
                "status-admin";

            const buttonLabel =
                user.status === "Ativo" ? "Editar" :
                user.status === "Inativo" ? "Reativar" :
                "Gerenciar";

            const cardHTML = `
                <div class="usuario">
                    <div class="avatar-container">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="User Avatar">
                    </div>
                    
                    <div class="info-container">
                        <strong>Nome</strong>
                        <p>${user.nome}</p>
                    </div>
                    
                    <div class="info-container">
                        <strong>Email</strong>
                        <p>${user.email}</p>
                    </div>
                    
                    <div class="status-container">
                        <strong>Status</strong>
                        <p class="${statusClass}">${user.status}</p>
                    </div>

                    <div class="button-container">
                        <button class="edit-btn" data-edit="${user.id}">${buttonLabel}</button>
                        <button class="delete-btn" data-delete="${user.id}">Excluir</button>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", cardHTML);
        });

        // Attach event listeners
        attachEventListeners(users);

    } catch (err) {
        console.error("Erro:", err);
        toastify("erro", "Erro ao carregar usuários");
    }
}

// ==========================
// ATTACH EVENT LISTENERS
// ==========================
function attachEventListeners(users) {
    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-delete");
            if (id) {
                removeUsuario(id);
            }
        });
    });

    // Edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-edit");
            const user = users.find(u => u.id == id);
            if (user) {
                openEditModal(user);
            }
        });
    });
}

// ==========================
// DELETE USER
// ==========================
async function removeUsuario(id) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    try {
        const res = await fetch(`${baseUrl}/api/Usuario/${id}`, { 
            method: "DELETE",
            headers 
        });

        if (res.ok) {
            toastify("sucesso", "Usuário excluído com sucesso!");
            get();
        } else {
            toastify("erro", "Erro ao excluir usuário!");
        }
    } catch (error) {
        console.error("Error:", error);
        toastify("erro", "Erro de conexão!");
    }
}

// ==========================
// CREATE USER
// ==========================
function initializeCreateButton() {
    const criarBtn = document.getElementById("criar");
    if (criarBtn) {
        // Remove any existing listeners
        const newCriarBtn = criarBtn.cloneNode(true);
        criarBtn.parentNode.replaceChild(newCriarBtn, criarBtn);
        
        newCriarBtn.addEventListener("click", () => {
            editingUserId = null;
            const modalTitle = document.getElementById("modal-title");
            const editName = document.getElementById("editName");
            const editEmail = document.getElementById("editEmail");
            const editPassword = document.getElementById("editPassword");
            
            if (modalTitle) modalTitle.textContent = "Criar Usuário";
            if (editName) editName.value = "";
            if (editEmail) editEmail.value = "";
            if (editPassword) editPassword.value = "";
            
            showModal();
        });
    }
}

// ==========================
// EDIT USER
// ==========================
function openEditModal(user) {
    editingUserId = user.id;
    const modalTitle = document.getElementById("modal-title");
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPassword = document.getElementById("editPassword");
    
    if (modalTitle) modalTitle.textContent = "Editar Usuário";
    if (editName) editName.value = user.nome;
    if (editEmail) editEmail.value = user.email;
    if (editPassword) editPassword.value = "";
    
    showModal();
}

// ==========================
// SAVE (Create or Update)
// ==========================
function initializeSaveButton() {
    const salvarBtn = document.getElementById("salvar");
    if (salvarBtn) {
        // Remove any existing listeners
        const newSalvarBtn = salvarBtn.cloneNode(true);
        salvarBtn.parentNode.replaceChild(newSalvarBtn, salvarBtn);
        
        newSalvarBtn.addEventListener("click", async () => {
            const editName = document.getElementById("editName");
            const editEmail = document.getElementById("editEmail");
            const editPassword = document.getElementById("editPassword");
            
            const nome = editName ? editName.value.trim() : "";
            const email = editEmail ? editEmail.value.trim() : "";
            const senha = editPassword ? editPassword.value.trim() : "";

            if (!nome || !email) {
                toastify("erro", "Por favor, preencha nome e email!");
                return;
            }

            const payload = {
                nome: nome,
                email: email
            };

            // Only include password if provided
            if (senha) {
                payload.senha = senha;
            }

            try {
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
                    toastify("erro", "Erro ao salvar usuário!");
                }
            } catch (error) {
                console.error("Error:", error);
                toastify("erro", "Erro de conexão!");
            }
        });
    }
}

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
        const toast = document.getElementById(id);
        if (toast) {
            toast.remove();
        }
    }, 3000);
}