document.addEventListener('DOMContentLoaded', function() {
    console.log('⚡ Quantum Login Activated - All buttons ready');
    
    // ========== PASSWORD TOGGLE ==========
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            console.log('👁️ Password visibility toggled');
        });
    }

    // ========== STATUS MESSAGE HANDLER ==========
    function showStatus(message, type = 'error') {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-message status-${type}`;
            statusEl.style.display = 'block';
            console.log(`📢 Status: ${type} - ${message}`);
            
            if (type === 'success') {
                setTimeout(() => {
                    statusEl.style.display = 'none';
                }, 5000);
            }
        }
    }

    // ========== MAIN LOGIN BUTTON - FIXED ==========
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔄 Login form submitted');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('loginButton');
            
            // Show loading state
            if (loginButton) {
                loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTHENTICATING...';
                loginButton.disabled = true;
            }
            
            showStatus('Connecting to quantum servers...', 'loading');
            
            try {
                console.log('🌐 Fetching API data from: http://localhost:5042/api/Usuario');
                
                // Try to connect to API
                const response = await fetch('http://localhost:5042/api/Usuario');
                console.log('📡 API Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                
                const apiData = await response.json();
                console.log('✅ API Data received:', apiData);
                
                // Handle response format
                let users = [];
                if (Array.isArray(apiData)) {
                    users = apiData;
                } else if (apiData && typeof apiData === 'object') {
                    users = [apiData];
                }
                
                console.log(`👥 Found ${users.length} user(s)`);
                
                // Check credentials - LOOK FOR email OR name fields
                const matchedUser = users.find(user => {
                    // Check if user has email or name that matches
                    const usernameMatch = 
                        (user.email && user.email.toLowerCase() === username.toLowerCase()) ||
                        (user.name && user.name.toLowerCase() === username.toLowerCase());
                    
                    // Check password - try different field names
                    const passwordMatch = 
                        (user.senha === password) || 
                        (user.password === password) ||
                        (user.pass === password);
                    
                    console.log(`Checking user: ${user.email || user.name} - Username match: ${usernameMatch}, Password match: ${passwordMatch}`);
                    return usernameMatch && passwordMatch;
                });
                
                // FIXED: Check if matchedUser exists
                if (matchedUser) {
                    // SUCCESS!
                    console.log('🎉 Login successful! User:', matchedUser);
                    showStatus(`✓ Welcome ${matchedUser.name || matchedUser.email}! Redirecting...`, 'success');
                    
                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-check"></i> ACCESS GRANTED';
                    }
                    
                    // Store user data
                    localStorage.setItem('userData', JSON.stringify(matchedUser));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // SHOW DUCK LOADING HERE
                    if (window.duckLoading) {
                        window.duckLoading.show();
                    } else {
                        console.warn('⚠️ Duck loading not initialized. Make sure loading.js is loaded.');
                    }
                    
                    // REDIRECT after duck animation completes
                    setTimeout(() => {
                        console.log('🚀 Attempting redirect...');
                        
                        // Hide loading screen right before redirect
                        if (window.duckLoading) {
                            window.duckLoading.hide();
                        }
                        
                        // Redirect to home page
                        window.location.href = '/Home/index.html';
                        
                        console.log('📤 Redirect initiated');
                    }, 4000); // Match the 4-second duck walk
                    
                } else {
                    // FAILED - No matching user found
                    console.log('❌ No matching user found');
                    console.log('Tried username:', username, 'Password:', password);
                    console.log('Available users:', users);
                    
                    showStatus('✗ Invalid credentials. Try: admin / 12345', 'error');
                    
                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> ACCESS NEURAL NETWORK';
                        loginButton.disabled = false;
                    }
                    
                    // Auto-fill test credentials
                    if (!username && !password) {
                        document.getElementById('username').value = 'admin';
                        document.getElementById('password').value = '12345';
                        showStatus('Test credentials loaded. Click Login again.', 'success');
                        setTimeout(() => {
                            showStatus('', 'success'); // Clear message
                        }, 3000);
                    }
                }
                
            } catch (error) {
                // NETWORK/API ERROR
                console.error('💥 Login error:', error);
                showStatus(`✗ Connection error: ${error.message}`, 'error');
                
                if (loginButton) {
                    loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> ACCESS NEURAL NETWORK';
                    loginButton.disabled = false;
                }
                
                // Debug info
                console.log('🔧 Debug info:');
                console.log('1. Make sure API is running on http://localhost:5042');
                console.log('2. Open browser console (F12) to see errors');
                console.log('3. Check if CORS is enabled on API');
            }
        });
    }

    // ========== GOOGLE LOGIN BUTTON ==========
    const googleLogin = document.getElementById('googleLogin');
    if (googleLogin) {
        googleLogin.addEventListener('click', function() {
            console.log('🔵 Google login clicked');
            showStatus('Google OAuth would open here', 'success');
        });
    }

    // ========== GITHUB LOGIN BUTTON ==========
    const githubLogin = document.getElementById('githubLogin');
    if (githubLogin) {
        githubLogin.addEventListener('click', function() {
            console.log('⚫ GitHub login clicked');
            showStatus('GitHub OAuth would open here', 'success');
        });
    }

    // ========== REGISTER LINK ==========
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📝 Register link clicked');
            showStatus('Registration form would open here', 'success');
        });
    }

    // ========== FORGOT PASSWORD LINK ==========
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔑 Forgot password clicked');
            showStatus('Password reset form would open here', 'success');
        });
    }

    // ========== REMEMBER ME CHECKBOX ==========
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        rememberMe.addEventListener('change', function() {
            console.log('💾 Remember me:', this.checked);
        });
    }

    // ========== TEST: CLICK ANY INPUT TO AUTO-FILL ==========
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('click', function() {
            if (this.value === '') {
                this.value = 'admin';
                document.getElementById('password').value = '12345';
                showStatus('Test credentials loaded', 'success');
                setTimeout(() => {
                    const statusEl = document.getElementById('statusMessage');
                    if (statusEl) statusEl.style.display = 'none';
                }, 2000);
            }
        });
    }

    // ========== PAGE LOADED ==========
    console.log('✅ All buttons and forms are ready!');
    showStatus('System ready. Enter credentials and click Login.', 'success');
    setTimeout(() => {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) statusEl.style.display = 'none';
    }, 3000);
});