// Configuration - USE HTTP NOT HTTPS
const API_BASE_URL = 'http://localhost:5042/api'; // HTTP
let lastUpdateTime = new Date();

// Wait for page to load
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    initializeDashboard();
    setupSideImages();
    startLiveUpdates();
});

// Main function
async function initializeDashboard() {
    try {
        console.log('Starting dashboard...');
        
        // Try to connect to API
        const isConnected = await testConnection();
        
        if (isConnected) {
            // Load real data
            await loadRealData();
            showToast('✅ Connected to live data', 'success');
            updateStatus('✅ Connected to API');
        } else {
            // Use fallback data
            loadFallbackData();
            showToast('⚠️ Using demo data', 'warning');
            updateStatus('⚠️ Using demo data - API offline');
        }
        
        updateLastUpdateTime();
    } catch (error) {
        console.error('Error:', error);
        loadFallbackData();
        updateStatus('❌ Error: ' + error.message);
    }
}

// Test connection
async function testConnection() {
    try {
        console.log('Testing connection to:', API_BASE_URL + '/dashboard/stats');
        const response = await fetch(API_BASE_URL + '/dashboard/stats');
        return response.ok;
    } catch (error) {
        console.log('Connection failed:', error.message);
        return false;
    }
}

// Load real data from API
async function loadRealData() {
    try {
        const [stats, activity, sideImages] = await Promise.all([
            fetch(API_BASE_URL + '/dashboard/stats').then(r => r.json()),
            fetch(API_BASE_URL + '/dashboard/activity').then(r => r.json()),
            fetch(API_BASE_URL + '/dashboard/sideimages').then(r => r.json())
        ]);
        
        // Update dashboard stats
        if (stats.success && stats.data) {
            updateDashboard(stats.data);
        }
        
        // Update activity
        if (activity.success && activity.data) {
            updateActivity(activity.data);
        }
        
        // Update side images
        if (sideImages.success && sideImages.data) {
            updateElement('kitchen-orders', sideImages.data.leftImage.value || 0);
            updateElement('active-waiters', sideImages.data.rightImage.value || 0);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        throw error;
    }
}

// Update dashboard with data
function updateDashboard(data) {
    // Tables
    updateElement('mesas-count', data.mesas.total || 0);
    updateElement('occupied-tables', `${data.mesas.occupied || 0}/${data.mesas.total || 0}`);
    
    // Occupancy bar
    const percentage = data.mesas.total ? (data.mesas.occupied / data.mesas.total) * 100 : 0;
    updateOccupancyBar(percentage);
    
    // Menu
    updateElement('menu-items-count', data.menu.totalItems || 0);
    updateElement('orders-today', data.menu.ordersToday || 0);
    
    // Bills
    updateElement('active-bills', data.comandas.active || 0);
    updateElement('today-revenue', `R$ ${(data.comandas.todayRevenue || 0).toFixed(2)}`);
    updateElement('avg-order-value', `R$ ${(data.comandas.avgOrderValue || 0).toFixed(2)}`);
    
    // Users
    updateElement('users-count', data.users.total || 0);
    
    // Kitchen
    updateElement('kitchen-queue', data.kitchen.pending || 0);
    updateElement('avg-wait-time', `${data.kitchen.avgWaitTime || 0}min`);
    updateElement('longest-wait', `${data.kitchen.longestWait || 0}min`);
    
    // Reservations
    updateElement('today-reservations', data.reservations.today || 0);
    
    // Side images
    updateElement('kitchen-orders', data.kitchen.pending || 0);
    updateElement('active-waiters', data.users.total || 0);
}

// Update activity list
function updateActivity(activities) {
    const list = document.getElementById('recent-activity');
    if (!list) return;
    
    list.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <i class="fas fa-${getIcon(activity.type)}"></i>
            <span>${activity.description}</span>
            <span class="activity-time">${formatTime(activity.timestamp)}</span>
        `;
        list.appendChild(item);
    });
}

// Load fallback data
function loadFallbackData() {
    // Set demo values
    updateElement('kitchen-orders', '5');
    updateElement('active-waiters', '3');
    updateElement('mesas-count', '15');
    updateElement('occupied-tables', '8/15');
    updateOccupancyBar(53);
    updateElement('menu-items-count', '42');
    updateElement('orders-today', '24');
    updateElement('active-bills', '6');
    updateElement('today-revenue', 'R$ 2.850,75');
    updateElement('avg-order-value', 'R$ 118,78');
    updateElement('users-count', '8');
    updateElement('kitchen-queue', '5');
    updateElement('avg-wait-time', '18min');
    updateElement('longest-wait', '32min');
    updateElement('today-reservations', '7');
}

// Helper functions
function getIcon(type) {
    const icons = {
        'order': 'receipt',
        'reservation': 'calendar-check',
        'payment': 'credit-card',
        'user': 'user',
        'table': 'chair',
        'kitchen': 'utensils'
    };
    return icons[type] || 'bell';
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateOccupancyBar(percentage) {
    const bar = document.getElementById('occupancy-level');
    if (bar) {
        bar.style.width = `${percentage}%`;
        bar.style.background = percentage > 70 ? '#e17055' : percentage > 40 ? '#fdcb6e' : '#00b894';
    }
}

function updateStatus(message) {
    updateElement('api-status-text', message);
}

function updateLastUpdateTime() {
    lastUpdateTime = new Date();
    const time = lastUpdateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    updateElement('last-update-time', time);
}

function showToast(message, type) {
    if (typeof Toastify === 'undefined') return;
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'error' ? '#e17055' : 
                        type === 'success' ? '#00b894' : '#6c5ce7'
    }).showToast();
}

// Setup side images animation
function setupSideImages() {
    setTimeout(() => {
        document.querySelectorAll('.side-image').forEach((img, i) => {
            setTimeout(() => {
                img.style.opacity = "1";
                img.style.transform = i === 0 ? "translateX(-30px)" : "translateX(30px)";
            }, i * 300);
        });
    }, 500);
}

// Live updates
function startLiveUpdates() {
    setInterval(() => {
        initializeDashboard();
    }, 30000);
}

// Button events
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refresh-btn')?.addEventListener('click', initializeDashboard);
    document.getElementById('notification-badge')?.addEventListener('click', () => {
        showToast('Activity refreshed', 'info');
    });
});