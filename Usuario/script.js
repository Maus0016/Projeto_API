// ==========================
// CONFIG
// ==========================
const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

let editingUserId = null;
let usersData = []; // Store users globally for event listeners

// Show toast notification (like home page)
function showToast(message, type = 'info') {
    if (typeof Toastify === 'undefined') return;
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'error' ? '#e17055' : 
                        type === 'success' ? '#00b894' : '#6c5ce7',
        className: "toast-notification"
    }).showToast();
}

// Wait for page to load with home page animation
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    getUsuarios();
    setupNotifications();
    setupEventListeners(); // Initialize button listeners
});

// ==========================
// CUSTOM DELETE CONFIRMATION MODAL
// ==========================
function showDeleteConfirmation(userId, userData) {
    closeModal();
    
    document.body.insertAdjacentHTML("beforeend", `
        <div class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 450px; text-align: center;">
                <div style="margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #e17055, #ff7675); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h2 style="color: rgba(255,255,255,0.9); margin-bottom: 10px; font-size: 1.8rem;">
                        <i class="fas fa-trash"></i> Excluir Usuário
                    </h2>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.5;">
                        Tem certeza que deseja excluir o usuário <strong>${userData.nome}</strong>?
                    </p>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-top: 20px; border: 1px solid rgba(255, 255, 255, 0.08);">
                        <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                            <i class="fas fa-info-circle"></i> Esta ação não pode ser desfeita
                        </p>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button id="confirmDelete" style="background: linear-gradient(135deg, #e17055, #ff7675);">
                        <i class="fas fa-check"></i> Sim, Excluir
                    </button>
                    <button id="cancelDelete" class="cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `);

    // Add show class after a small delay for animation
    setTimeout(() => {
        const modal = document.querySelector(".modal:last-of-type");
        if (modal) modal.classList.add("show");
    }, 10);

    document.getElementById("cancelDelete").onclick = closeModal;

    document.getElementById("confirmDelete").onclick = async () => {
        await removeUsuario(userId);
    };
}

// ==========================
// LOAD USERS
// ==========================
async function getUsuarios() {
    try {
        const res = await fetch(`${baseUrl}/api/Usuario`, { headers });
        if (!res.ok) throw new Error('Failed to fetch users');
        
        usersData = await res.json(); // Store globally
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (usersData.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-users" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhum usuário encontrado</h3>
                    <p style="color: rgba(255,255,255,0.5);">Clique em "Novo Usuário" para criar um</p>
                </div>
            `;
            return;
        }

        usersData.forEach((user, index) => {
            const statusClass =
                user.status === "Ativo" ? "status-ativo" :
                user.status === "Inativo" ? "status-inativo" :
                "status-admin";

            const statusIcon =
                user.status === "Ativo" ? "fa-check-circle" :
                user.status === "Inativo" ? "fa-ban" :
                "fa-crown";

            const buttonLabel =
                user.status === "Ativo" ? "Editar" :
                user.status === "Inativo" ? "Reativar" :
                "Gerenciar";

            const cardHTML = `
                <div class="usuario" style="animation-delay: ${index * 0.1}s">
                    <div class="avatar-container">
                        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="User Avatar">
                    </div>
                    
                    <div class="info-container">
                        <strong><i class="fas fa-user"></i> Nome</strong>
                        <p>${user.nome}</p>
                    </div>
                    
                    <div class="info-container">
                        <strong><i class="fas fa-envelope"></i> Email</strong>
                        <p>${user.email}</p>
                    </div>
                    
                    <div class="status-container">
                        <strong><i class="fas ${statusIcon}"></i> Status</strong>
                        <p class="${statusClass}">${user.status}</p>
                    </div>

                    <div class="button-container">
                        <button class="edit-btn" data-id="${user.id}">
                            <i class="fas fa-edit"></i> ${buttonLabel}
                        </button>
                        <button class="delete-btn" data-id="${user.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", cardHTML);
        });

        // Re-attach event listeners after DOM update
        setTimeout(attachEventListeners, 100);
        
        showToast(`✓ ${usersData.length} usuários carregados`, 'success');

    } catch (err) {
        console.error("Erro:", err);
        showToast('❌ Erro ao carregar usuários', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar usuários</h3>
                <p style="color: rgba(255,255,255,0.5);">${err.message}</p>
                <button onclick="getUsuarios()" style="margin-top: 20px; background: linear-gradient(135deg, #6c5ce7, #8a7cff); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==========================
// ATTACH EVENT LISTENERS (FIXED)
// ==========================
function attachEventListeners() {
    console.log("Attaching event listeners...");
    
    // Delete buttons - Use event delegation for better performance
    document.addEventListener('click', function(e) {
        // Check if clicked element is a delete button or child of delete button
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const userId = deleteBtn.getAttribute('data-id');
            const user = usersData.find(u => u.id == userId);
            
            if (user) {
                console.log("Delete button clicked for user:", user.nome);
                showDeleteConfirmation(userId, user);
            } else {
                console.log("User not found for ID:", userId);
            }
        }
        
        // Check if clicked element is an edit button
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const userId = editBtn.getAttribute('data-id');
            const user = usersData.find(u => u.id == userId);
            
            if (user) {
                console.log("Edit button clicked for user:", user.nome);
                openEditModal(user);
            }
        }
    });
    
    // Also attach direct listeners as backup
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.removeEventListener("click", handleDeleteClick);
        btn.addEventListener("click", handleDeleteClick);
    });
    
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.removeEventListener("click", handleEditClick);
        btn.addEventListener("click", handleEditClick);
    });
}

// Separate handler functions
function handleDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = this.getAttribute('data-id');
    const user = usersData.find(u => u.id == userId);
    
    if (user) {
        console.log("Direct delete listener triggered for:", user.nome);
        showDeleteConfirmation(userId, user);
    }
}

function handleEditClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = this.getAttribute('data-id');
    const user = usersData.find(u => u.id == userId);
    
    if (user) {
        console.log("Direct edit listener triggered for:", user.nome);
        openEditModal(user);
    }
}

// ==========================
// DELETE USER
// ==========================
async function removeUsuario(id) {
    try {
        const res = await fetch(`${baseUrl}/api/Usuario/${id}`, { 
            method: "DELETE",
            headers 
        });

        if (res.ok) {
            showToast('✓ Usuário excluído com sucesso!', 'success');
            closeModal();
            setTimeout(() => getUsuarios(), 800);
        } else {
            throw new Error('Falha ao excluir usuário');
        }
    } catch (error) {
        console.error("Error:", error);
        showToast('❌ Erro ao excluir usuário', 'error');
    }
}

// ==========================
// MODAL MANAGEMENT
// ==========================
function setupEventListeners() {
    // Create button
    const criarBtn = document.getElementById("criar");
    if (criarBtn) {
        criarBtn.addEventListener("click", () => {
            editingUserId = null;
            const modalTitle = document.getElementById("modal-title");
            const editName = document.getElementById("editName");
            const editEmail = document.getElementById("editEmail");
            const editPassword = document.getElementById("editPassword");
            
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Novo Usuário';
            if (editName) editName.value = "";
            if (editEmail) editEmail.value = "";
            if (editPassword) editPassword.value = "";
            
            showModal();
        });
    }
    
    // Save button
    const salvarBtn = document.getElementById("salvar");
    if (salvarBtn) {
        salvarBtn.addEventListener("click", handleSave);
    }
    
    // Cancel button
    const cancelarBtn = document.getElementById("cancelar");
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
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    });
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
    
    if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-edit"></i> Editar Usuário #${user.id}`;
    if (editName) editName.value = user.nome;
    if (editEmail) editEmail.value = user.email;
    if (editPassword) editPassword.value = "";
    
    showModal();
}

// ==========================
// SAVE (Create or Update)
// ==========================
async function handleSave() {
    const saveButton = document.getElementById("salvar");
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;

    try {
        const editName = document.getElementById("editName");
        const editEmail = document.getElementById("editEmail");
        const editPassword = document.getElementById("editPassword");
        
        const nome = editName ? editName.value.trim() : "";
        const email = editEmail ? editEmail.value.trim() : "";
        const senha = editPassword ? editPassword.value.trim() : "";

        if (!nome || !email) {
            showToast('❌ Por favor, preencha nome e email!', 'error');
            return;
        }

        const payload = {
            nome: nome,
            email: email
        };

        // Only include password if provided (or for new user)
        if (senha || editingUserId === null) {
            payload.senha = senha || "123456"; // Default password for new users
        }

        let res;
        let isCreate = editingUserId === null;

        if (isCreate) {
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
            showToast(isCreate ? '✓ Usuário criado com sucesso!' : '✓ Usuário atualizado com sucesso!', 'success');
            closeModal();
            setTimeout(() => getUsuarios(), 800);
        } else {
            throw new Error('Falha ao salvar usuário');
        }
    } catch (error) {
        console.error("Error:", error);
        showToast('❌ Erro ao salvar usuário', 'error');
    } finally {
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    }
}

// Setup notifications (like home page)
function setupNotifications() {
    // You can add notification functionality here
    // For now, we'll just show a welcome notification
    setTimeout(() => {
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = 'flex';
        showToast('Bem-vindo aos Usuários!', 'info');
    }, 1000);
}