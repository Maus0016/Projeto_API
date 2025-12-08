class DuckLoading {
    constructor() {
        this.container = null;
        this.duckContainer = null;
        this.progressBar = null;
        this.trailInterval = null;
        this.isActive = false;
    }

    // Initialize the loading screen
    init() {
        // Create loading container HTML
        const loadingHTML = `
            <div class="loading-container" id="duckLoading">
                <div class="pixel-text">QUANTUM LOADING</div>
                
                <div class="duck-scene">
                    <div class="road">
                        <div class="road-line"></div>
                    </div>
                    
                    <div class="duck-container" data-direction="right">
                        <!-- CHANGED to duck_walk.gif -->
                        <img src="duck_walk.gif" class="duck-gif" alt="Walking Duck">
                    </div>
                </div>
                
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                
                <div class="loading-text">
                    Initializing quantum systems...
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        
        // Store references
        this.container = document.getElementById('duckLoading');
        this.duckContainer = document.querySelector('.duck-container');
        this.progressBar = document.querySelector('.progress-bar');
        
        // Add loading text style
        const style = document.createElement('style');
        style.textContent = `
            .loading-text {
                margin-top: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-family: 'Courier New', monospace;
                font-size: 14px;
                letter-spacing: 1px;
                text-transform: uppercase;
                animation: loadingText 3s ease-in-out infinite;
            }
            
            @keyframes loadingText {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .duck-scene {
                    width: 90vw;
                    height: 150px;
                }
                
                .duck-gif {
                    width: 80px;
                    height: 80px;
                }
                
                .pixel-text {
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
        
        console.log('🦆 Duck Loading initialized');
    }

    // Show loading screen
    show() {
        if (!this.container) this.init();
        
        this.isActive = true;
        this.container.style.display = 'flex';
        
        // Reset progress bar
        this.progressBar.style.animation = 'none';
        setTimeout(() => {
            this.progressBar.style.animation = 'progressFill 4s linear forwards';
        }, 10);
        
        // Start quantum trail effect
        this.startQuantumTrail();
        
        // Cycle loading messages
        this.cycleLoadingMessages();
        
        console.log('🦆 Duck loading started');
    }

    // Hide loading screen
    hide() {
        if (!this.container || !this.isActive) return;
        
        this.isActive = false;
        
        // Stop effects
        this.stopQuantumTrail();
        
        // Fade out animation
        this.container.style.animation = 'fadeIn 0.3s ease reverse';
        
        setTimeout(() => {
            this.container.style.display = 'none';
            this.container.style.animation = 'fadeIn 0.3s ease';
            console.log('🦆 Duck loading completed');
        }, 300);
    }

    // Create quantum particle trail
    startQuantumTrail() {
        let trailCount = 0;
        
        this.trailInterval = setInterval(() => {
            if (!this.isActive || trailCount > 50) {
                this.stopQuantumTrail();
                return;
            }
            
            const trail = document.createElement('div');
            trail.className = 'quantum-trail';
            
            // Position at duck's current position
            const duckRect = this.duckContainer.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();
            
            const x = duckRect.left - containerRect.left + 60;
            const y = duckRect.top - containerRect.top + 60;
            
            trail.style.left = `${x}px`;
            trail.style.top = `${y}px`;
            
            // Random color
            const colors = ['#6c5ce7', '#8a7cff', '#f8b500', '#ff7e5f'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            trail.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
            
            this.container.appendChild(trail);
            
            // Remove after animation
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
            }, 300);
            
            trailCount++;
        }, 100);
    }

    // Stop quantum trail
    stopQuantumTrail() {
        if (this.trailInterval) {
            clearInterval(this.trailInterval);
            this.trailInterval = null;
        }
    }

    // Cycle through loading messages
    cycleLoadingMessages() {
        const messages = [
            'Initializing quantum systems...',
            'Calibrating neural network...',
            'Loading user profile...',
            'Synchronizing data streams...',
            'Finalizing authentication...',
            'Ready for quantum leap...'
        ];
        
        let index = 0;
        const loadingText = document.querySelector('.loading-text');
        if (!loadingText) return;
        
        const messageInterval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(messageInterval);
                return;
            }
            
            loadingText.textContent = messages[index];
            index = (index + 1) % messages.length;
        }, 800);
    }

    // Simulate progress (for manual control)
    setProgress(percent) {
        if (this.progressBar) {
            this.progressBar.style.animation = 'none';
            this.progressBar.style.width = `${percent}%`;
        }
    }
}

// Create global instance
window.duckLoading = new DuckLoading();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.duckLoading.init();
    console.log('🚀 Duck Loading System Ready');
});