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
    getReservas();
    setupNotifications();
    setupModalEvents();
});

// ==================== CUSTOM DELETE CONFIRMATION MODAL ====================
function showDeleteConfirmation(reservaId, reservaData) {
    // First close any existing delete modals
    closeDeleteModalOnly();
    
    document.body.insertAdjacentHTML("beforeend", `
        <div class="modal delete-confirmation-modal">
            <div class="modal-content" style="max-width: 450px; text-align: center;">
                <div style="margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #e17055, #ff7675); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h2 style="color: rgba(255,255,255,0.9); margin-bottom: 10px; font-size: 1.8rem;">
                        <i class="fas fa-trash"></i> Cancelar Reserva
                    </h2>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.5;">
                        Tem certeza que deseja cancelar a reserva <strong>#${reservaData.id}</strong> para <strong>${reservaData.nomeCliente}</strong>?
                    </p>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-top: 20px; border: 1px solid rgba(255, 255, 255, 0.08);">
                        <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                            <i class="fas fa-info-circle"></i> Esta ação não pode ser desfeita
                        </p>
                    </div>
                </div>

                <div class="modal-buttons">
                    <button id="confirmDelete" style="background: linear-gradient(135deg, #e17055, #ff7675);">
                        <i class="fas fa-check"></i> Sim, Cancelar
                    </button>
                    <button id="cancelDelete" class="cancel">
                        <i class="fas fa-times"></i> Não
                    </button>
                </div>
            </div>
        </div>
    `);

    // Add smooth animation for modal
    setTimeout(() => {
        const modal = document.querySelector('.delete-confirmation-modal');
        if (modal) {
            modal.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }
    }, 10);

    // Store references to buttons for cleanup
    const cancelBtn = document.getElementById("cancelDelete");
    const confirmBtn = document.getElementById("confirmDelete");
    
    // Create a single event handler that can be removed later
    const cancelHandler = () => closeDeleteModalOnly();
    
    cancelBtn.onclick = cancelHandler;

    confirmBtn.onclick = async () => {
        const confirmBtn = document.getElementById("confirmDelete");
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';
        confirmBtn.disabled = true;
        
        await removeReserva(reservaId);
        
        // Restore button state if there was an error
        setTimeout(() => {
            if (confirmBtn && confirmBtn.parentNode) {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        }, 2000);
    };
}

// ==================== LOAD RESERVAS ====================
async function getReservas() {
    try {
        const res = await fetch(`${baseUrl}/api/Reservas`, { headers });
        if (!res.ok) throw new Error('Failed to fetch reservas');
        
        const reservas = await res.json();
        const container = document.querySelector(".container");
        
        // Clear loading message
        container.innerHTML = "";
        
        if (reservas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                    <i class="fas fa-calendar-check" style="font-size: 3rem; opacity: 0.5; margin-bottom: 20px;"></i>
                    <h3 style="color: rgba(255,255,255,0.7);">Nenhuma reserva encontrada</h3>
                    <p style="color: rgba(255,255,255,0.5);">Clique em "Nova Reserva" para criar uma</p>
                </div>
            `;
            return;
        }

        reservas.forEach((reserva, index) => {
            const statusClass = "status-pendente";
            const statusIcon = "fa-clock";
            const statusText = "Pendente";
            
            // Format date if available
            let dataFormatada = reserva.data || "Não informada";
            if (reserva.data && reserva.data.includes('T')) {
                const dataObj = new Date(reserva.data);
                dataFormatada = dataObj.toLocaleDateString('pt-BR');
            }

            container.insertAdjacentHTML("beforeend", `
                <div class="reserva" style="animation-delay: ${index * 0.1}s">
                    <h2><i class="fas fa-hashtag"></i> Reserva #${reserva.id}</h2>
                    <p><i class="fas fa-chair"></i> <strong>Mesa:</strong> ${reserva.numeroMesa || "Não informada"}</p>
                    <p><i class="fas fa-user"></i> <strong>Cliente:</strong> ${reserva.nomeCliente}</p>
                    <p><i class="fas fa-phone"></i> <strong>Telefone:</strong> ${reserva.telefone || "Não informado"}</p>
                    <p><i class="fas fa-calendar-day"></i> <strong>Data:</strong> ${dataFormatada}</p>
                    <p><i class="fas ${statusIcon}"></i> <strong>Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                    
                    <div class="button-container">
                        <button class="edit-btn" data-id="${reserva.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-btn" data-id="${reserva.id}">
                            <i class="fas fa-trash"></i> Cancelar
                        </button>
                    </div>
                </div>
            `);
        });

        // Add event listeners for edit buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            const reserva = reservas.find(x => x.id == btn.dataset.id);
            if (reserva) {
                btn.addEventListener("click", () => openEditModal(reserva));
            }
        });

        // Add event listeners for delete buttons with improved error handling
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const selected = reservas.find(x => x.id == id);
                if (selected) {
                    showDeleteConfirmation(id, selected);
                } else {
                    showToast('❌ Reserva não encontrada para exclusão', 'error');
                }
            });
        });
        
        showToast(`✓ ${reservas.length} reservas carregadas`, 'success');
        
    } catch (error) {
        console.error('Error loading reservas:', error);
        showToast('❌ Erro ao carregar reservas', 'error');
        
        const container = document.querySelector(".container");
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e17055; margin-bottom: 20px;"></i>
                <h3 style="color: rgba(255,255,255,0.7);">Erro ao carregar reservas</h3>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
                <button onclick="getReservas()" style="margin-top: 20px; background: linear-gradient(135deg, #6c5ce7, #8a7cff); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// ==================== MODAL CONTROLS ====================
function setupModalEvents() {
    const modal = document.getElementById("modalReserva");
    
    // Close modal buttons
    document.querySelectorAll(".closeModal").forEach(btn => {
        btn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    });

    // Create button
    document.getElementById("criarReserva").addEventListener("click", () => {
        resetModalFields();
        modal.dataset.mode = "create";
        modal.classList.remove("hidden");
        
        // Update title
        document.querySelector("#modalReserva h2").innerHTML = '<i class="fas fa-calendar-plus"></i> Nova Reserva';
    });

    // Save button
    document.getElementById("salvarReserva").addEventListener("click", async () => {
        await saveReserva();
    });
}

// ==================== EDIT MODAL ====================
function openEditModal(reserva) {
    const modal = document.getElementById("modalReserva");
    
    document.getElementById("reservaCliente").value = reserva.nomeCliente || "";
    document.getElementById("reservaTelefone").value = reserva.telefone || "";
    document.getElementById("reservaMesa").value = reserva.numeroMesa || "";
    document.getElementById("reservaData").value = reserva.data ? reserva.data.split('T')[0] : "";
    document.getElementById("reservaHora").value = reserva.hora || "";
    document.getElementById("reservaDescricao").value = reserva.descricao || "";

    modal.dataset.mode = "edit";
    modal.dataset.id = reserva.id;

    // Update title
    document.querySelector("#modalReserva h2").innerHTML = `<i class="fas fa-edit"></i> Editar Reserva #${reserva.id}`;

    modal.classList.remove("hidden");
}

// ==================== SAVE (CREATE OR EDIT) ====================
async function saveReserva() {
    const modal = document.getElementById("modalReserva");
    const saveButton = document.getElementById("salvarReserva");
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveButton.disabled = true;

    try {
        const payload = {
            nomeCliente: document.getElementById("reservaCliente").value.trim(),
            telefone: document.getElementById("reservaTelefone").value.trim(),
            numeroMesa: Number(document.getElementById("reservaMesa").value),
            data: document.getElementById("reservaData").value,
            hora: document.getElementById("reservaHora").value,
            descricao: document.getElementById("reservaDescricao").value.trim()
        };

        // Validation
        if (!payload.nomeCliente) {
            showToast('❌ Nome do cliente é obrigatório', 'error');
            return;
        }

        if (!payload.numeroMesa) {
            showToast('❌ Número da mesa é obrigatório', 'error');
            return;
        }

        let response;
        if (modal.dataset.mode === "create") {
            response = await fetch(`${baseUrl}/api/Reservas`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            });
        } else {
            const id = modal.dataset.id;
            response = await fetch(`${baseUrl}/api/Reservas/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            showToast(modal.dataset.mode === "create" ? '✓ Reserva criada com sucesso!' : '✓ Reserva atualizada com sucesso!', 'success');
            modal.classList.add("hidden");
            setTimeout(() => getReservas(), 800);
        } else {
            let errorMsg = 'Falha ao salvar reserva';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.title || errorMsg;
            } catch (e) {
                errorMsg = response.statusText || errorMsg;
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error("Save error:", error);
        showToast(`❌ ${error.message}`, 'error');
    } finally {
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    }
}

// ==================== DELETE RESERVA ====================
async function removeReserva(id) {
    console.log("Attempting to delete reservation ID:", id);
    
    try {
        const response = await fetch(`${baseUrl}/api/Reservas/${id}`, { 
            method: "DELETE",
            headers: headers
        });

        console.log("Delete response status:", response.status);
        
        if (response.ok) {
            showToast('✓ Reserva cancelada com sucesso!', 'success');
            closeDeleteModalOnly();
            // Refresh the reservations list
            setTimeout(() => getReservas(), 500);
        } else {
            let errorMsg = 'Falha ao cancelar reserva';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.title || errorMsg;
            } catch (e) {
                errorMsg = response.statusText || errorMsg;
            }
            console.error("Delete failed:", errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error("Delete error:", error);
        showToast(`❌ ${error.message}`, 'error');
        // Don't close modal on error so user can see the error
    }
}

// ==================== RESET MODAL FIELDS ====================
function resetModalFields() {
    document.getElementById("reservaCliente").value = "";
    document.getElementById("reservaTelefone").value = "";
    document.getElementById("reservaMesa").value = "";
    document.getElementById("reservaData").value = "";
    document.getElementById("reservaHora").value = "";
    document.getElementById("reservaDescricao").value = "";
}

// Setup notifications (like home page)
function setupNotifications() {
    setTimeout(() => {
        document.getElementById('notification-badge').style.display = 'flex';
        showToast('Bem-vindo às Reservas!', 'info');
    }, 1000);
}

// ==================== CLOSE DELETE MODAL ONLY ====================
function closeDeleteModalOnly() {
    // Animate and remove delete confirmation modal
    document.querySelectorAll(".delete-confirmation-modal").forEach(modal => {
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
}

// ==================== CLOSE ALL MODALS ====================
function closeAllModals() {
    // Animate and remove all modals
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Close edit/create modal
    const mainModal = document.getElementById("modalReserva");
    if (mainModal) {
        mainModal.classList.add("hidden");
    }
}

// Close delete modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-confirmation-modal')) {
        closeDeleteModalOnly();
    }
});

// Close main modal when clicking outside
document.addEventListener('click', (e) => {
    const mainModal = document.getElementById("modalReserva");
    if (mainModal && !mainModal.classList.contains('hidden') && 
        e.target.classList.contains('modal')) {
        mainModal.classList.add("hidden");
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDeleteModalOnly();
        const mainModal = document.getElementById("modalReserva");
        if (mainModal) {
            mainModal.classList.add("hidden");
        }
    }
});

// Legacy function for compatibility
function closeModals() {
    closeAllModals();
}