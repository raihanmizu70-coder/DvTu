// Digital Vision Trusted - Main Application
// Part 1: Core Functionality

class DigitalVisionApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.db = window.firebaseDB;
        this.auth = window.firebaseAuth;
        this.userId = null;
        this.userData = null;
        this.isVerified = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Telegram
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.setHeaderColor('#667eea');
            this.tg.setBackgroundColor('#ffffff');
            
            // Show loading
            this.showLoading('Loading app...');
            
            // Get Telegram user
            const tgUser = this.tg.initDataUnsafe.user;
            if (tgUser) {
                this.userId = tgUser.id.toString();
                console.log("Telegram User:", tgUser);
                
                // Check verification status
                await this.checkVerificationStatus();
                
                // Register or update user
                await this.registerUser(tgUser);
                
                // Load user data
                await this.loadUserData();
                
                // Update UI
                this.updateUI();
            } else {
                // Test mode for development
                console.warn("No Telegram user found, using test mode");
                this.userId = "test_user_" + Date.now();
                await this.loadTestData();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading
            this.hideLoading();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('App load error. Please refresh.');
        }
    }
    
    async checkVerificationStatus() {
        // Check if user joined required channels
        const joinedChannels = localStorage.getItem('channels_verified');
        
        if (joinedChannels === 'true') {
            this.isVerified = true;
            this.showMainContent();
        } else {
            this.isVerified = false;
            this.showVerificationScreen();
        }
    }
    
    async verifyChannels() {
        try {
            // In real app, you would check Telegram channel membership
            // For now, we'll simulate verification
            
            this.showLoading('Verifying channels...');
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mark as verified
            localStorage.setItem('channels_verified', 'true');
            this.isVerified = true;
            
            // Show success message
            this.tg.showAlert('Channels verified successfully!');
            
            // Show main content
            this.showMainContent();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Verification error:', error);
            this.tg.showAlert('Verification failed. Please try again.');
            this.hideLoading();
        }
    }
    
    showVerificationScreen() {
        document.getElementById('verificationSection').style.display = 'block';
        document.getElementById('categoriesSection').style.display = 'none';
    }
    
    showMainContent() {
        document.getElementById('verificationSection').style.display = 'none';
        document.getElementById('categoriesSection').style.display = 'block';
    }
    
    async registerUser(tgUser) {
        try {
            if (!this.db) {
                console.warn('Firebase not available, skipping user registration');
                return;
            }
            
            const userRef = this.db.collection('users').doc(this.userId);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                // New user - create record
                const referralCode = this.generateReferralCode();
                
                await userRef.set({
                    telegramId: tgUser.id,
                    firstName: tgUser.first_name,
                    lastName: tgUser.last_name || '',
                    username: tgUser.username || '',
                    languageCode: tgUser.language_code || 'bn',
                    referralCode: referralCode,
                    joinedAt: new Date(),
                    balance: {
                        main: 0,
                        cash: 0,
                        bonus: 0
                    },
                    stats: {
                        totalEarned: 0,
                        tasksCompleted: 0,
                        referrals: 0,
                        totalWithdrawn: 0,
                        todayEarned: 0
                    },
                    settings: {
                        notifications: true,
                        theme: 'light'
                    }
                });
                
                console.log('New user registered:', tgUser.id);
                
                // Check for referral from URL
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref');
                if (refCode) {
                    await this.processReferral(refCode);
                }
            }
            
        } catch (error) {
            console.error('User registration error:', error);
        }
    }
    
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'DV';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    async loadUserData() {
        try {
            if (!this.db) {
                // Use test data
                this.userData = this.getTestData();
                return;
            }
            
            const userDoc = await this.db.collection('users').doc(this.userId).get();
            
            if (userDoc.exists) {
                this.userData = userDoc.data();
                console.log('User data loaded:', this.userData);
            } else {
                // Create default data
                this.userData = {
                    firstName: 'User',
                    balance: { main: 0, cash: 0, bonus: 0 },
                    stats: { tasksCompleted: 0, referrals: 0, totalWithdrawn: 0 },
                    referralCode: 'DV' + Math.random().toString(36).substr(2, 6).toUpperCase()
                };
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.userData = this.getTestData();
        }
    }
    
    getTestData() {
        return {
            firstName: 'Test User',
            balance: {
                main: 150,
                cash: 75,
                bonus: 25
            },
            stats: {
                tasksCompleted: 12,
                referrals: 3,
                totalWithdrawn: 200,
                todayEarned: 45
            },
            referralCode: 'DVTRUST123'
        };
    }
    
    updateUI() {
        // Update balance
        if (this.userData && this.userData.balance) {
            const totalBalance = this.userData.balance.cash;
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = `${totalBalance} টাকা`;
            }
        }
        
        // Update stats
        this.updateStats();
        
        // Update referral code in sidebar (if sidebar exists)
        const refCodeElement = document.getElementById('refCode');
        if (refCodeElement && this.userData) {
            refCodeElement.textContent = this.userData.referralCode || 'DVTRUST123';
        }
    }
    
    updateStats() {
        if (!this.userData || !this.userData.stats) return;
        
        const todayEarnElement = document.getElementById('todayEarn');
        const completedTasksElement = document.getElementById('completedTasks');
        const referralCountElement = document.getElementById('referralCount');
        
        if (todayEarnElement) {
            todayEarnElement.textContent = `${this.userData.stats.todayEarned || 0} টাকা`;
        }
        
        if (completedTasksElement) {
            completedTasksElement.textContent = this.userData.stats.tasksCompleted || 0;
        }
        
        if (referralCountElement) {
            referralCountElement.textContent = this.userData.stats.referrals || 0;
        }
    }
    
    setupEventListeners() {
        // Navigation click handlers
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                
                // Add active to clicked
                item.classList.add('active');
                
                // Handle navigation
                const text = item.querySelector('span').textContent;
                this.handleNavigation(text.toLowerCase());
            });
        });
        
        // Category click handlers
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.querySelector('h3').textContent;
                this.openCategory(category);
            });
        });
    }
    
    handleNavigation(page) {
        switch(page) {
            case 'home':
                this.showHome();
                break;
            case 'refer':
                this.showRefer();
                break;
            case 'income':
                this.showIncome();
                break;
            case 'withdraw':
                this.showWithdraw();
                break;
            case 'profile':
                this.showProfile();
                break;
        }
    }
    
    showHome() {
        // Already on home
        console.log('Showing home');
    }
    
    showRefer() {
        this.tg.showAlert('Refer page coming soon!');
        // Will implement later
    }
    
    showIncome() {
        this.tg.showAlert('Income page coming soon!');
        // Will implement later
    }
    
    showWithdraw() {
        this.tg.showAlert('Withdraw page coming soon!');
        // Will implement later
    }
    
    showProfile() {
        this.tg.showAlert('Profile page coming soon!');
        // Will implement later
    }
    
    openCategory(category) {
        const categoryMap = {
            'Micro Job': 'microjob.html',
            'GST Code Sell': 'gstcode.html',
            'F Code Sell': 'fcode.html',
            'Insite Sell': 'insite.html',
            'ID Recover': 'recover.html',
            'Diamond Top-Up': 'diamond.html',
            'Shop': 'shop.html',
            'GetLike': 'getlike.html',
            'Niva Coin': 'nivacoin.html',
            'TikTok': 'tiktok.html'
        };
        
        const page = categoryMap[category];
        if (page) {
            window.location.href = `categories/${page}`;
        } else {
            this.tg.showAlert(`${category} category coming soon!`);
        }
    }
    
    showLoading(message = 'Loading...') {
        // Create loading overlay
        const loadingHtml = `
            <div class="loading-overlay" id="loadingOverlay">
                <div class="loading-content">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Remove existing if any
        const existing = document.getElementById('loadingOverlay');
        if (existing) existing.remove();
        
        // Add new
        const div = document.createElement('div');
        div.innerHTML = loadingHtml;
        document.body.appendChild(div);
    }
    
    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
        }
    }
    
    showError(message) {
        this.tg.showAlert(message);
    }
    
    showSuccess(message) {
        this.tg.showAlert(`✅ ${message}`);
    }
}

// Global functions for HTML onclick
function verifyChannels() {
    if (window.app) {
        window.app.verifyChannels();
    }
}

function openCategory(category) {
    if (window.app) {
        window.app.openCategory(category);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function openWallet() {
    if (window.app) {
        window.app.showWithdraw();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitalVisionApp();
});

// Add loading styles
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }
    
    .loading-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

document.head.appendChild(loadingStyles);
