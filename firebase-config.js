// Firebase Configuration Template
// YOU WILL REPLACE THESE VALUES WITH YOUR OWN

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "digital-vision-trusted.firebaseapp.com",
    projectId: "digital-vision-trusted",
    storageBucket: "digital-vision-trusted.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// DO NOT CHANGE BELOW THIS LINE
window.firebaseConfig = firebaseConfig;

// Initialize Firebase
let app, db, auth;

if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            console.error("Firebase persistence error:", err);
        });
}

// Export for use in other files
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;

console.log("Firebase configured successfully!");
