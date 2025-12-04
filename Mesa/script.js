// Configuration - USE HTTP NOT HTTPS
const baseUrl = "http://localhost:5042";
const headers = { "Content-Type": "application/json" };

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
    getMesas();
    setupNotifications();
});

// ==================== CUSTOM DELETE CONFIRMATION MODAL ====================
function showDeleteConfirmation(mesaId, mesaData) {
    closeModals();
    
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal" style="max-width: 450px; text-align: center;">
                <div style="margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #e17055, #ff7675); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h3 style="color: rgba(255,255,255,0.9); margin-bottom: 10px;">
                        <i class="fas fa-trash"></i> Excluir Mesa
                    </h3>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.5;">
                        Tem certeza que deseja excluir a mesa <strong>#${mesaData.numeroMesa}</strong>?
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

    document.getElementById("cancelDelete").onclick = closeModals;

    document.getElementById("confirmDelete").onclick = async () => {
        await removeMesa(mesaId);
    };
}

// ==================== GET MESAS ====================
async function getMesas() {
    try {
        const res = await fetch(`${baseUrl}/api/Mesa`, { headers });
        if (!res.ok) throw new Error('Failed to fetch mesas');
        
        const mesas = await res.json();
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (mesas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-chair" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhuma mesa encontrada</h3>
                    <p style="color: rgba(255,255,255,0.5);">Clique em "Nova Mesa" para criar uma</p>
                </div>
            `;
            return;
        }

        mesas.forEach((mesa, index) => {
            let situacaoText = "Disponível";
            let statusClass = "status-disponivel";
            let statusIcon = "fa-check-circle";

            if (mesa.situacaoMesa === 1) { 
                situacaoText = "Ocupada"; 
                statusClass = "status-ocupada";
                statusIcon = "fa-users";
            }
            if (mesa.situacaoMesa === 2) { 
                situacaoText = "Reservada"; 
                statusClass = "status-reservada";
                statusIcon = "fa-calendar-check";
            }

            container.insertAdjacentHTML("beforeend", `
                <div class="mesa" style="animation-delay: ${index * 0.1}s">
                    <div class="info-container">
                        <strong><i class="fas fa-hashtag"></i> Número da Mesa</strong>
                        <p>#${mesa.numeroMesa}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas ${statusIcon}"></i> Status</strong>
                        <p class="${statusClass}">${situacaoText}</p>
                    </div>

                    <div class="button-container">
                        <button class="edit-btn" data-id="${mesa.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-btn" data-id="${mesa.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `);
        });

        // Add event listeners
        document.querySelectorAll(".edit-btn").forEach(btn => {
            const mesa = mesas.find(m => m.id == btn.dataset.id);
            btn.onclick = () => openEditModal(mesa);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute("data-id");
                const selected = mesas.find(m => m.id == id);
                showDeleteConfirmation(id, selected);
            };
        });
        
        showToast(`✓ ${mesas.length} mesas carregadas`, 'success');
        
    } catch (error) {
        console.error('Error loading mesas:', error);
        showToast('❌ Erro ao carregar mesas', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar mesas</h3>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
                <button onclick="getMesas()" style="margin-top: 20px; background: linear-gradient(135deg, #6c5ce7, #8a7cff); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==================== EDIT MODAL ====================
function openEditModal(mesa) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3><i class="fas fa-edit"></i> Editar Mesa #${mesa.numeroMesa}</h3>

                <div class="input-container">
                    <label for="edit-numeroMesa">Número da Mesa</label>
                    <input type="number" id="edit-numeroMesa" value="${mesa.numeroMesa}" min="1" placeholder="Digite o número da mesa">
                </div>

                <div class="input-container">
                    <label for="edit-situacaoMesa">Situação</label>
                    <select id="edit-situacaoMesa">
                        <option value="0" ${mesa.situacaoMesa === 0 ? 'selected' : ''}>Disponível</option>
                        <option value="1" ${mesa.situacaoMesa === 1 ? 'selected' : ''}>Ocupada</option>
                        <option value="2" ${mesa.situacaoMesa === 2 ? 'selected' : ''}>Reservada</option>
                    </select>
                </div>

                <div class="modal-buttons">
                    <button id="saveEdit">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                    <button id="closeEditModal" class="cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("closeEditModal").onclick = closeModals;

    document.getElementById("saveEdit").onclick = async () => {
        const saveButton = document.getElementById("saveEdit");
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        saveButton.disabled = true;

        try {
            const update = {
                numeroMesa: Number(document.getElementById("edit-numeroMesa").value),
                situacaoMesa: Number(document.getElementById("edit-situacaoMesa").value)
            };

            if (!update.numeroMesa) {
                showToast('❌ Número da mesa é obrigatório', 'error');
                return;
            }

            const response = await fetch(`${baseUrl}/api/Mesa/${mesa.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(update)
            });

            if (response.ok) {
                showToast('✓ Mesa atualizada com sucesso!', 'success');
                closeModals();
                setTimeout(() => getMesas(), 800);
            } else {
                throw new Error('Falha ao atualizar mesa');
            }
        } catch (error) {
            showToast('❌ Erro ao atualizar mesa', 'error');
        } finally {
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    };
}

// ==================== DELETE MESA ====================
async function removeMesa(id) {
    try {
        const response = await fetch(`${baseUrl}/api/Mesa/${id}`, { 
            method: "DELETE" 
        });

        if (response.ok) {
            showToast('✓ Mesa excluída com sucesso!', 'success');
            closeModals();
            setTimeout(() => getMesas(), 800);
        } else {
            throw new Error('Falha ao excluir mesa');
        }
    } catch (error) {
        showToast('❌ Erro ao excluir mesa', 'error');
    }
}

// ==================== CREATE MESA ====================
function openCreateModal() {
    const button = document.getElementById("criar");

    button.addEventListener("click", () => {
        closeModals();

        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h3><i class="fas fa-plus"></i> Nova Mesa</h3>

                    <div class="input-container">
                        <label for="newNumeroMesa">Número da Mesa *</label>
                        <input type="number" id="newNumeroMesa" placeholder="Digite o número" min="1">
                    </div>

                    <div class="input-container">
                        <label for="newSituacaoMesa">Situação Inicial</label>
                        <select id="newSituacaoMesa">
                            <option value="0">Disponível</option>
                            <option value="1">Ocupada</option>
                            <option value="2">Reservada</option>
                        </select>
                    </div>

                    <div class="modal-buttons">
                        <button id="createBtn">
                            <i class="fas fa-save"></i> Criar Mesa
                        </button>
                        <button id="closeCreateModal" class="cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `);

        document.getElementById("closeCreateModal").onclick = closeModals;

        document.getElementById("createBtn").onclick = async () => {
            const createButton = document.getElementById("createBtn");
            const originalText = createButton.innerHTML;
            createButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
            createButton.disabled = true;

            try {
                const mesa = {
                    numeroMesa: Number(document.getElementById("newNumeroMesa").value),
                    situacaoMesa: Number(document.getElementById("newSituacaoMesa").value)
                };

                if (!mesa.numeroMesa) {
                    showToast('❌ Número da mesa é obrigatório', 'error');
                    return;
                }

                const response = await fetch(`${baseUrl}/api/Mesa`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(mesa)
                });

                if (response.ok) {
                    showToast('✓ Mesa criada com sucesso!', 'success');
                    closeModals();
                    setTimeout(() => getMesas(), 1000);
                } else {
                    throw new Error('Falha ao criar mesa');
                }
            } catch (error) {
                showToast('❌ Erro ao criar mesa', 'error');
            } finally {
                createButton.innerHTML = originalText;
                createButton.disabled = false;
            }
        };
    });
}

// Setup notifications (like home page)
function setupNotifications() {
    setTimeout(() => {
        document.getElementById('notification-badge').style.display = 'flex';
        showToast('Bem-vindo às Mesas!', 'info');
    }, 1000);
}

// Initialize
openCreateModal();

// ==================== CLOSE MODALS ====================
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}