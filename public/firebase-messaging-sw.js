// This is the CRITICAL line. It imports the Firebase App library, which makes the global 'firebase' object available.
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);

// This line imports the Firebase Messaging library. It's needed for the messaging features.
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// Copy your Firebase configuration from firebase.jsx here.
// NOTE: This must be the same configuration used in your main app.
const firebaseConfig = {
  apiKey: "AIzaSyC0exeQOxXe08I2ydDbNNmAa_86YgB-yKk",
  authDomain: "guest-management-63e17.firebaseapp.com",
  projectId: "guest-management-63e17",
  storageBucket: "guest-management-63e17.firebasestorage.app",
  messagingSenderId: "695608027119",
  appId: "1:695608027119:web:949901f351c62ee540781a",
  measurementId: "G-ZF4MTBLW8Z",
};

// Now that the 'firebase' object is available, you can initialize the app.
// This line will no longer throw the "firebase is not defined" error.
firebase.initializeApp(firebaseConfig);

// Get a reference to the messaging service.
const messaging = firebase.messaging();

// Handle incoming messages while the app is in the background.
// This function will display a notification to the user.
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico", // Use a default icon
    data: payload.data, // Pass through any custom data
  };

  // Display the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
