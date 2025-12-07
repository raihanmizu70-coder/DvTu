// bot-commands.js - Admin এর জন্য
const adminCommands = {
    // Admin Task Management
    '/tasks': 'See pending tasks',
    '/approve [task_id]': 'Approve task',
    '/reject [task_id]': 'Reject task',
    
    // User Management
    '/users': 'See all users',
    '/balance [user_id] [amount]': 'Update balance',
    
    // Content Management
    '/add_task [title] [reward]': 'Add new task',
    '/add_code [type] [name] [price]': 'Add code',
    
    // Withdrawal Management
    '/withdrawals': 'See pending withdrawals',
    '/pay [withdrawal_id]': 'Mark as paid'
};
