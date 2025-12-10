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
    get();
    setupNotifications();
});

// ==================== CUSTOM DELETE CONFIRMATION MODAL ====================
function showDeleteConfirmation(pedidoId, pedidoData) {
    closeModals();
    
    document.body.insertAdjacentHTML("beforeend", `
        <div class="popup-overlay">
            <div class="popup-box" style="max-width: 450px; text-align: center;">
                <div style="margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #e17055, #ff7675); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h2 style="color: rgba(255,255,255,0.9); margin-bottom: 10px; font-size: 1.8rem;">
                        <i class="fas fa-trash"></i> Excluir Pedido
                    </h2>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.5;">
                        Tem certeza que deseja excluir o pedido <strong>#${pedidoData.id}</strong> da comanda <strong>${pedidoData.comandaId}</strong>?
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
        await removePedidoCozinha(pedidoId);
    };
}

// ==================== GET PEDIDOS COZINHA ====================
async function get() {
    try {
        const res = await fetch(`${baseUrl}/api/PedidoCozinha`, { headers });
        if (!res.ok) throw new Error('Failed to fetch pedidos');
        
        const pedidos = await res.json();
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (pedidos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-concierge-bell" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhum pedido na cozinha</h3>
                    <p style="color: rgba(255,255,255,0.5);">Todos os pedidos estão preparados!</p>
                </div>
            `;
            return;
        }

        pedidos.forEach((pedido, index) => {
            container.insertAdjacentHTML("beforeend", `
                <div class="pedido" style="animation-delay: ${index * 0.1}s">
                    <div class="info-container">
                        <strong><i class="fas fa-hashtag"></i> Número do Pedido</strong>
                        <p>#${pedido.id}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-receipt"></i> ID da Comanda</strong>
                        <p>${pedido.comandaId}</p>
                    </div>
                    <div class="info-container">
                        <strong><i class="fas fa-utensils"></i> Itens do Pedido</strong>
                        <p>${pedido.itens || "Nenhum item informado"}</p>
                    </div>

                    <div class="button-container">
                        <button class="delete-btn" data-id="${pedido.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `);
        });

        // Attach event listeners for delete buttons only
        attachEventListeners(pedidos);
        
        showToast(`✓ ${pedidos.length} pedidos carregados`, 'success');
        
    } catch (error) {
        console.error('Error loading pedidos:', error);
        showToast('❌ Erro ao carregar pedidos', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar pedidos</h3>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
                <button onclick="get()" style="margin-top: 20px; background: linear-gradient(135deg, #6c5ce7, #8a7cff); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==================== ATTACH EVENT LISTENERS ====================
function attachEventListeners(pedidos) {
    // Delete buttons only (edit removed)
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const selected = pedidos.find(p => p.id == id);
            if (selected) {
                showDeleteConfirmation(id, selected);
            }
        });
    });
}

// ==================== DELETE PEDIDO ====================
async function removePedidoCozinha(id) {
    try {
        const response = await fetch(`${baseUrl}/api/PedidoCozinha/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showToast('✓ Pedido excluído com sucesso!', 'success');
            closeModals();
            setTimeout(() => get(), 800);
        } else {
            let errorMsg = 'Falha ao excluir pedido';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.title || errorMsg;
            } catch (e) {
                errorMsg = response.statusText || errorMsg;
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast(`❌ ${error.message}`, 'error');
    }
}

// Setup notifications (like home page)
function setupNotifications() {
    setTimeout(() => {
        document.getElementById('notification-badge').style.display = 'flex';
        showToast('Bem-vindo à Cozinha!', 'info');
    }, 1000);
}

// ==================== CLOSE MODALS ====================
function closeModals() {
    document.querySelectorAll(".popup-overlay").forEach(w => w.remove());
}