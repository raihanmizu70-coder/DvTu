// telegram-bot-api.js
class TelegramBackend {
    constructor() {
        this.botToken = "8506336833:AAHqTala7chpEiJJ2W1s6lSN5qgwdJpC5b8";
        this.botUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    
    async submitTask(userId, taskId, proofImage) {
        // ১. ছবি Telegram Bot কে পাঠাবো
        const photoMessage = await this.sendPhotoToBot(proofImage);
        
        // ২. টাস্ক ডাটা save করবো
        await this.saveTaskData(userId, taskId, photoMessage.photo[0].file_id);
        
        // ৩. Admin কে notify করবো
        await this.notifyAdmin(userId, taskId);
        
        return { success: true, message: "Task submitted to admin" };
    }
    
    async sendPhotoToBot(photoBlob) {
        const formData = new FormData();
        formData.append('chat_id', 'YOUR_ADMIN_CHAT_ID');
        formData.append('photo', photoBlob);
        
        const response = await fetch(`${this.botUrl}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }
}
