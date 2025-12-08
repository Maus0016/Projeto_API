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
    get();
    setupNotifications();
});

// ==================== GET ITEMS ====================
async function get() {
    try {
        const res = await fetch(`${baseUrl}/api/CardapioItem`, { headers });
        if (!res.ok) throw new Error('Failed to fetch items');
        
        const cardapioItems = await res.json();
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (cardapioItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-utensils" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhum item no cardápio</h3>
                    <p style="color: rgba(255,255,255,0.5);">Clique em "Novo Item" para adicionar</p>
                </div>
            `;
            return;
        }

        cardapioItems.forEach((item, index) => {
            const preparo = item.possuiPreparo ? "Sim" : "Não";
            
            container.insertAdjacentHTML("beforeend", `
                <div class="cardapioitem" style="animation-delay: ${index * 0.1}s">
                    <div class="info-container">
                        <strong><i class="fas fa-heading"></i> Título</strong>
                        <p>${item.titulo}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-align-left"></i> Descrição</strong>
                        <p>${item.descricao}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-money-bill-wave"></i> Preço</strong>
                        <p>R$ ${Number(item.preco).toFixed(2)}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-concierge-bell"></i> Possui Preparo</strong>
                        <p>${preparo}</p>
                    </div>

                    <!-- FIXED: EDIT FIRST, DELETE SECOND -->
                    <div class="button-container">
                        <!-- EDIT BUTTON (LEFT) -->
                        <button id="${item.id}_edit">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        
                        <!-- DELETE BUTTON (RIGHT) -->
                        <button id="${item.id}_delete">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `);

            // Keep the event listeners the same
            document.getElementById(`${item.id}_delete`)
                .addEventListener("click", () => removeCardapioitem(item.id));

            document.getElementById(`${item.id}_edit`)
                .addEventListener("click", () => openEditModal(item));
        });
        
        showToast(`✓ ${cardapioItems.length} itens carregados`, 'success');
        
    } catch (error) {
        console.error('Error loading items:', error);
        showToast('❌ Erro ao carregar itens', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar cardápio</h3>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
                <button onclick="get()" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==================== EDIT MODAL ====================
function openEditModal(item) {
    document.body.insertAdjacentHTML("beforeend", `
        <div class="wrapper">
            <div class="modal">
                <h2 style="margin-bottom: 25px; text-align: center; color: rgba(255,255,255,0.9);">
                    <i class="fas fa-edit"></i> Editar Item
                </h2>
                
                <div class="input-container">
                    <label for="titulo">Título</label>
                    <input type="text" value="${item.titulo}" id="titulo" placeholder="Digite o título"/>
                </div>
                <div class="input-container">
                    <label for="descricao">Descrição</label>
                    <input type="text" value="${item.descricao}" id="descricao" placeholder="Digite a descrição"/>
                </div>
                <div class="input-container">
                    <label for="preco">Preço (R$)</label>
                    <input type="number" step="0.01" value="${item.preco}" id="preco" placeholder="0.00"/>
                </div>
                <div class="input-container">
                    <label>
                        <input type="checkbox" id="edit_preparo" ${item.possuiPreparo ? "checked" : ""}/>
                        Possui Preparo
                    </label>
                </div>

                <div class="button-container">
                    <button id="update" style="background: linear-gradient(135deg, #00b894, #00d2a2);">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                    <button id="cancelEdit">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    `);

    document.getElementById("update").addEventListener("click", async () => {
        const updateButton = document.getElementById("update");
        const originalText = updateButton.innerHTML;
        updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        updateButton.disabled = true;

        try {
            const updateData = {
                titulo: document.getElementById("titulo").value,
                descricao: document.getElementById("descricao").value,
                preco: Number(document.getElementById("preco").value),
                possuiPreparo: document.getElementById("edit_preparo").checked
            };

            if (!updateData.titulo.trim()) {
                showToast('❌ Título é obrigatório', 'error');
                return;
            }

            const response = await fetch(`${baseUrl}/api/CardapioItem/${item.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                showToast('✓ Item atualizado com sucesso!', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                throw new Error('Falha ao atualizar');
            }
        } catch (error) {
            showToast('❌ Erro ao atualizar item', 'error');
        } finally {
            updateButton.innerHTML = originalText;
            updateButton.disabled = false;
        }
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
        document.querySelector('.wrapper').remove();
    });
}

// ==================== DELETE ====================
async function removeCardapioitem(id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
        const response = await fetch(`${baseUrl}/api/CardapioItem/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showToast('✓ Item excluído com sucesso!', 'success');
            setTimeout(() => location.reload(), 800);
        } else {
            throw new Error('Falha ao excluir');
        }
    } catch (error) {
        showToast('❌ Erro ao excluir item', 'error');
    }
}

// ==================== CREATE ====================
function openCreateModal() {
    const button = document.getElementById("criar");

    button.addEventListener("click", () => {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="wrapper">
                <div class="modal">
                    <h2 style="margin-bottom: 25px; text-align: center; color: rgba(255,255,255,0.9);">
                        <i class="fas fa-plus"></i> Novo Item
                    </h2>
                    
                    <div class="input-container">
                        <label for="titulo">Título *</label>
                        <input type="text" id="titulo" placeholder="Digite o título" required/>
                    </div>
                    <div class="input-container">
                        <label for="descricao">Descrição</label>
                        <input type="text" id="descricao" placeholder="Digite a descrição"/>
                    </div>
                    <div class="input-container">
                        <label for="preco">Preço (R$) *</label>
                        <input type="number" step="0.01" id="preco" placeholder="0.00" required/>
                    </div>
                    <div class="input-container">
                        <label>
                            <input type="checkbox" id="possuiPreparo"/>
                            Possui Preparo
                        </label>
                    </div>

                    <div class="button-container">
                        <button id="create" style="background: linear-gradient(135deg, #6c5ce7, #8a7cff);">
                            <i class="fas fa-save"></i> Criar Item
                        </button>
                        <button id="cancelCreate">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `);

        document.getElementById("create").addEventListener("click", async () => {
            const createButton = document.getElementById("create");
            const originalText = createButton.innerHTML;
            createButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
            createButton.disabled = true;

            try {
                const cardapioItem = {
                    titulo: document.getElementById("titulo").value,
                    descricao: document.getElementById("descricao").value,
                    preco: Number(document.getElementById("preco").value),
                    possuiPreparo: document.getElementById("possuiPreparo").checked
                };

                if (!cardapioItem.titulo.trim() || !cardapioItem.preco) {
                    showToast('❌ Título e Preço são obrigatórios', 'error');
                    return;
                }

                const response = await fetch(`${baseUrl}/api/CardapioItem`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(cardapioItem)
                });

                if (response.ok) {
                    showToast('✓ Item criado com sucesso!', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error('Falha ao criar');
                }
            } catch (error) {
                showToast('❌ Erro ao criar item', 'error');
            } finally {
                createButton.innerHTML = originalText;
                createButton.disabled = false;
            }
        });

        document.getElementById("cancelCreate").addEventListener("click", () => {
            document.querySelector('.wrapper').remove();
        });
    });
}

// Setup notifications (like home page)
function setupNotifications() {
    // You can add notification functionality here
    // For now, we'll just show a welcome notification
    setTimeout(() => {
        document.getElementById('notification-badge').style.display = 'flex';
        showToast('Bem-vindo ao Cardápio!', 'info');
    }, 1000);
}

openCreateModal();