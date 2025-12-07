// telegram-photo-upload.js
// GitHub path: /js/telegram-photo-upload.js

class TelegramPhotoUpload {
    constructor() {
        this.botToken = "8506336833:AAHqTala7chpEiJJ2W1s6lSN5qgwdJpC5b8";
        this.adminChatId = "YOUR_ADMIN_CHAT_ID"; // আপনার Telegram ID
        this.botUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    
    // ছবি Telegram Bot কে পাঠানো
    async uploadPhotoToTelegram(photoFile, taskId, userId) {
        try {
            console.log("📸 Starting photo upload to Telegram...");
            
            // FormData তৈরি করা
            const formData = new FormData();
            formData.append('chat_id', this.adminChatId);
            formData.append('photo', photoFile);
            formData.append('caption', `Task: ${taskId}\nUser: ${userId}\nTime: ${new Date().toLocaleString()}`);
            
            // Telegram API call
            const response = await fetch(`${this.botUrl}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.ok) {
                console.log("✅ Photo uploaded successfully to Telegram");
                
                // File ID সংরক্ষণ
                const fileId = result.result.photo[0].file_id;
                
                return {
                    success: true,
                    fileId: fileId,
                    messageId: result.result.message_id,
                    chatId: result.result.chat.id
                };
            } else {
                console.error("❌ Telegram upload failed:", result);
                return {
                    success: false,
                    error: result.description
                };
            }
            
        } catch (error) {
            console.error("❌ Upload error:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ছবি Telegram থেকে ডাউনলোড (এডমিনের জন্য)
    async getPhotoFromTelegram(fileId) {
        try {
            const response = await fetch(`${this.botUrl}/getFile?file_id=${fileId}`);
            const result = await response.json();
            
            if (result.ok) {
                const filePath = result.result.file_path;
                const photoUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
                
                return {
                    success: true,
                    url: photoUrl,
                    filePath: filePath
                };
            } else {
                return {
                    success: false,
                    error: result.description
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // এডমিনকে নোটিফিকেশন পাঠানো
    async notifyAdmin(taskId, userId, userName) {
        const message = `
🆕 নতুন টাস্ক সাবমিশন!

📋 টাস্ক ID: ${taskId}
👤 ইউজার: ${userName} (${userId})
⏰ সময়: ${new Date().toLocaleString()}

/approve_${taskId} - Approve
/reject_${taskId} - Reject
/view_${taskId} - বিস্তারিত
        `;
        
        try {
            const response = await fetch(`${this.botUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: this.adminChatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error("Notification error:", error);
        }
    }
}

// Global instance তৈরি
window.TelegramPhotoUpload = TelegramPhotoUpload;
