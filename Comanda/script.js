// Configuration - USE HTTP NOT HTTPS
const baseUrl = "http://localhost:5042";
const headers = {
    "Content-Type": "application/json"
};

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
    getComandas();
    setupNotifications();
});

// ==================== CUSTOM DELETE CONFIRMATION MODAL ====================
function showDeleteConfirmation(comandaId, comandaData) {
    closeModals();
    
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal" style="max-width: 450px; text-align: center;">
                <div style="margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #e17055, #ff7675); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h3 style="color: rgba(255,255,255,0.9); margin-bottom: 10px;">
                        <i class="fas fa-trash"></i> Excluir Comanda
                    </h3>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.5;">
                        Tem certeza que deseja excluir a comanda <strong>#${comandaData.id}</strong> da mesa <strong>${comandaData.numeroMesa}</strong>?
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
        await removeComanda(comandaId);
    };
}

// ==================== GET COMANDAS ====================
async function getComandas() {
    try {
        const res = await fetch(`${baseUrl}/api/Comanda`, { headers });
        if (!res.ok) throw new Error('Failed to fetch comandas');
        
        const comandas = await res.json();
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (comandas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-receipt" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhuma comanda encontrada</h3>
                    <p style="color: rgba(255,255,255,0.5);">Clique em "Nova Comanda" para criar uma</p>
                </div>
            `;
            return;
        }

        comandas.forEach((comanda, index) => {
            const itemCount = Array.isArray(comanda.items) ? comanda.items.length : 0;
            
            container.insertAdjacentHTML("beforeend", `
                <div class="comanda" style="animation-delay: ${index * 0.1}s">
                    <div class="info-container">
                        <strong><i class="fas fa-hashtag"></i> ID da Comanda</strong>
                        <p>#${comanda.id}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-chair"></i> Número da Mesa</strong>
                        <p>${comanda.numeroMesa}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-user"></i> Nome do Cliente</strong>
                        <p>${comanda.nomeCliente || 'Não informado'}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-utensils"></i> Itens na Comanda</strong>
                        <p>${itemCount} itens</p>
                    </div>

                    <div class="button-container">
                        <button class="edit-btn" data-id="${comanda.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-btn" data-id="${comanda.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
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
                const id = btn.getAttribute("data-id");
                const selected = comandas.find(c => c.id == id);
                showDeleteConfirmation(id, selected);
            });
        });
        
        showToast(`✓ ${comandas.length} comandas carregadas`, 'success');
        
    } catch (error) {
        console.error('Error loading comandas:', error);
        showToast('❌ Erro ao carregar comandas', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar comandas</h3>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
                <button onclick="getComandas()" style="margin-top: 20px; background: linear-gradient(135deg, #6c5ce7, #8a7cff); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==================== EDIT MODAL ====================
function openEditModal(comanda) {
    closeModals();

    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h3><i class="fas fa-edit"></i> Editar Comanda #${comanda.id}</h3>

                <div class="input-container">
                    <label for="edit-numeroMesa">Número da Mesa</label>
                    <input type="number" value="${comanda.numeroMesa}" id="edit-numeroMesa" min="1" placeholder="Digite o número da mesa">
                </div>

                <div class="input-container">
                    <label for="edit-nomeCliente">Nome do Cliente</label>
                    <input type="text" value="${comanda.nomeCliente || ''}" id="edit-nomeCliente" placeholder="Digite o nome do cliente">
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
            const objComandaUpdate = {
                numeroMesa: Number(document.getElementById("edit-numeroMesa").value),
                nomeCliente: document.getElementById("edit-nomeCliente").value
            };

            if (!objComandaUpdate.numeroMesa) {
                showToast('❌ Número da mesa é obrigatório', 'error');
                return;
            }

            const response = await fetch(`${baseUrl}/api/Comanda/${comanda.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(objComandaUpdate)
            });

            if (response.ok) {
                showToast('✓ Comanda atualizada com sucesso!', 'success');
                closeModals();
                setTimeout(() => getComandas(), 800);
            } else {
                throw new Error('Falha ao atualizar comanda');
            }
        } catch (error) {
            showToast('❌ Erro ao atualizar comanda', 'error');
        } finally {
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    };
}

// ==================== DELETE COMANDA ====================
async function removeComanda(id) {
    try {
        const response = await fetch(`${baseUrl}/api/Comanda/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showToast('✓ Comanda excluída com sucesso!', 'success');
            closeModals();
            setTimeout(() => getComandas(), 800);
        } else {
            throw new Error('Falha ao excluir comanda');
        }
    } catch (error) {
        showToast('❌ Erro ao excluir comanda', 'error');
    }
}

// ==================== CREATE COMANDA ====================
function openCreateModal() {
    const button = document.querySelector("#criar");

    button.addEventListener("click", async () => {
        closeModals();

        // Create modal dynamically
        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h3><i class="fas fa-plus"></i> Nova Comanda</h3>

                    <div class="input-container">
                        <label for="create-numeroMesa">Número da Mesa *</label>
                        <input type="number" placeholder="Digite o número da mesa" id="create-numeroMesa" min="1">
                    </div>

                    <div class="input-container">
                        <label for="create-nomeCliente">Nome do Cliente</label>
                        <input type="text" placeholder="Digite o nome do cliente" id="create-nomeCliente">
                    </div>

                    <div class="checklist-container">
                        <label><i class="fas fa-utensils"></i> Itens do Cardápio</label>
                        <div class="checklist" id="itens-checklist">
                            <div style="text-align: center; padding: 20px;">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.7;">Carregando itens...</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-buttons">
                        <button id="createBtn">
                            <i class="fas fa-save"></i> Criar Comanda
                        </button>
                        <button id="closeCreateModal" class="cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `);

        // Load menu items from API
        await getCardapioItens();
        
        // Attach event listeners
        document.getElementById("closeCreateModal").onclick = closeModals;

        document.getElementById("createBtn").onclick = async () => {
            await createComanda();
        };
    });
}

// ==================== GET CARDAPIO ITENS FROM API ====================
async function getCardapioItens() {
    try {
        const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
        if (!res.ok) throw new Error('Failed to fetch menu items');
        
        const cardapioitens = await res.json();
        const itensContainer = document.getElementById("itens-checklist");
        
        // Clear loading message
        itensContainer.innerHTML = "";

        if (cardapioitens.length === 0) {
            itensContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-utensils" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Nenhum item no cardápio</p>
                </div>
            `;
            return;
        }

        cardapioitens.forEach(item => {
            itensContainer.insertAdjacentHTML("beforeend", `
                <div class="checklist-item">
                    <input type="checkbox" id="item-${item.id}" value="${item.id}" class="item-checkbox">
                    <label for="item-${item.id}">
                        <strong>${item.titulo}</strong> 
                        <span style="opacity: 0.8; font-size: 0.9rem; display: block; margin-top: 4px;">
                            ${item.descricao || 'Sem descrição'}
                        </span>
                        <span style="color: #00b894; font-weight: bold; display: block; margin-top: 4px;">
                            R$ ${Number(item.preco).toFixed(2)}
                        </span>
                    </label>
                </div>
            `);
        });
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        showToast('❌ Erro ao carregar itens do cardápio', 'error');
        
        const itensContainer = document.getElementById("itens-checklist");
        itensContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e17055;">
                <i class="fas fa-exclamation-triangle"></i>
                <p style="margin-top: 10px; font-size: 0.9rem;">Erro ao carregar itens do cardápio</p>
                <button onclick="getCardapioItens()" style="margin-top: 10px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 10px; cursor: pointer;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

// ==================== CREATE COMANDA FUNCTION ====================
async function createComanda() {
    const createButton = document.getElementById("createBtn");
    const originalText = createButton.innerHTML;
    createButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    createButton.disabled = true;

    try {
        const itensSelecionados = [];
        const checkboxes = document.querySelectorAll(".item-checkbox:checked");
        
        checkboxes.forEach(checkbox => {
            itensSelecionados.push(Number(checkbox.value));
        });

        const Comanda = {
            numeroMesa: Number(document.getElementById("create-numeroMesa").value),
            nomeCliente: document.getElementById("create-nomeCliente").value,
            cardapioItemIds: itensSelecionados
        };

        if (!Comanda.numeroMesa) {
            showToast('❌ Número da mesa é obrigatório', 'error');
            return;
        }

        const response = await fetch(`${baseUrl}/api/Comanda`, {
            method: "POST",
            headers,
            body: JSON.stringify(Comanda)
        });

        if (response.ok) {
            showToast('✓ Comanda criada com sucesso!', 'success');
            closeModals();
            setTimeout(() => getComandas(), 1000);
        } else {
            throw new Error('Falha ao criar comanda');
        }
    } catch (error) {
        showToast('❌ Erro ao criar comanda', 'error');
    } finally {
        createButton.innerHTML = originalText;
        createButton.disabled = false;
    }
}

// Setup notifications (like home page)
function setupNotifications() {
    // You can add notification functionality here
    setTimeout(() => {
        document.getElementById('notification-badge').style.display = 'flex';
        showToast('Bem-vindo às Comandas!', 'info');
    }, 1000);
}

// Initialize
openCreateModal();

// ==================== CLOSE MODALS ====================
function closeModals() {
    document.querySelectorAll(".wrapper").forEach(w => w.remove());
}