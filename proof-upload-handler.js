// proof-upload-handler.js
// GitHub path: /js/proof-upload-handler.js

class ProofUploadHandler {
    constructor() {
        this.uploader = new TelegramPhotoUpload();
        this.currentTaskId = null;
        this.currentUserId = null;
    }
    
    // ছবি আপলোড ইন্টারফেস শো করা
    showUploadInterface(taskId, taskTitle) {
        this.currentTaskId = taskId;
        this.currentUserId = window.Telegram.WebApp.initDataUnsafe.user?.id;
        
        const html = `
            <div class="upload-container" id="uploadContainer">
                <div class="upload-header">
                    <h3>📸 Submit Proof for: ${taskTitle}</h3>
                    <p>Please upload screenshot as proof of task completion</p>
                </div>
                
                <div class="upload-options">
                    <div class="upload-option" onclick="proofHandler.uploadFromCamera()">
                        <div class="option-icon">📷</div>
                        <div class="option-text">
                            <strong>Take Photo</strong>
                            <small>Use camera</small>
                        </div>
                    </div>
                    
                    <div class="upload-option" onclick="proofHandler.uploadFromGallery()">
                        <div class="option-icon">🖼️</div>
                        <div class="option-text">
                            <strong>Choose from Gallery</strong>
                            <small>Select existing photo</small>
                        </div>
                    </div>
                </div>
                
                <div class="upload-preview" id="previewArea" style="display:none;">
                    <img id="previewImage" src="" alt="Preview">
                    <div class="preview-actions">
                        <button onclick="proofHandler.submitProof()" class="btn-submit">✅ Submit Proof</button>
                        <button onclick="proofHandler.cancelUpload()" class="btn-cancel">❌ Cancel</button>
                    </div>
                </div>
                
                <div class="upload-progress" id="progressArea" style="display:none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <p id="progressText">Uploading...</p>
                </div>
                
                <div class="upload-instructions">
                    <h4>📋 Instructions:</h4>
                    <ul>
                        <li>Clear screenshot of completed task</li>
                        <li>Make sure username/ID is visible</li>
                        <li>File size should be less than 5MB</li>
                        <li>Allowed formats: JPG, PNG, WebP</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Main content এ শো করা
        document.getElementById('mainContent').innerHTML = html;
    }
    
    // ক্যামেরা থেকে ছবি তোলা
    async uploadFromCamera() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Rear camera
        
        input.onchange = (e) => this.handleFileSelect(e.target.files[0]);
        input.click();
    }
    
    // গ্যালারি থেকে ছবি নির্বাচন
    async uploadFromGallery() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => this.handleFileSelect(e.target.files[0]);
        input.click();
    }
    
    // ফাইল সিলেক্ট হ্যান্ডলিং
    handleFileSelect(file) {
        if (!file) return;
        
        // File validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        if (file.size > maxSize) {
            alert('❌ File size too large! Max 5MB allowed.');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert('❌ Invalid file type! Please use JPG, PNG or WebP.');
            return;
        }
        
        // Preview শো করা
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('previewArea').style.display = 'block';
            this.selectedFile = file;
        };
        reader.readAsDataURL(file);
    }
    
    // প্রুফ সাবমিট করা
    async submitProof() {
        if (!this.selectedFile) {
            alert('Please select a photo first!');
            return;
        }
        
        // Progress bar শো করা
        document.getElementById('progressArea').style.display = 'block';
        document.getElementById('previewArea').style.display = 'none';
        
        try {
            // Progress update
            this.updateProgress(30, 'Uploading to Telegram...');
            
            // Telegram এ আপলোড
            const result = await this.uploader.uploadPhotoToTelegram(
                this.selectedFile,
                this.currentTaskId,
                this.currentUserId
            );
            
            if (result.success) {
                this.updateProgress(70, 'Notifying admin...');
                
                // Admin কে notify করা
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                await this.uploader.notifyAdmin(
                    this.currentTaskId,
                    this.currentUserId,
                    user?.first_name || 'User'
                );
                
                this.updateProgress(100, 'Proof submitted successfully!');
                
                // Success message
                setTimeout(() => {
                    alert('✅ Proof submitted successfully!\nAdmin will review and update your balance.');
                    window.history.back(); // Previous page এ ফেরত
                }, 1000);
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            alert(`❌ Upload failed: ${error.message}`);
            
            document.getElementById('progressArea').style.display = 'none';
            document.getElementById('previewArea').style.display = 'block';
        }
    }
    
    // Progress update
    updateProgress(percent, message) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = message;
    }
    
    // ক্যান্সেল করা
    cancelUpload() {
        document.getElementById('previewArea').style.display = 'none';
        this.selectedFile = null;
    }
}

// Global instance
window.proofHandler = new ProofUploadHandler();
