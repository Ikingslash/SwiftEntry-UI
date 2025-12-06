import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api"; // Your Axios instance
import { toast } from "react-toastify";

// It's a best practice to load these from environment variables in a real app
const firebaseConfig = {
  apiKey: "AIzaSyC0exeQOxXe08I2ydDbNNmAa_86YgB-yKk",
  authDomain: "guest-management-63e17.firebaseapp.com",
  projectId: "guest-management-63e17",
  storageBucket: "guest-management-63e17.firebasestorage.app",
  messagingSenderId: "695608027119",
  appId: "1:695608027119:web:949901f351c62ee540787e",
  measurementId: "G-J5P7B1C8D9", // Assuming you have a measurement ID
};

// This VAPID key is crucial for associating your app with your Firebase project
const vapidKey =
  "BDUV_IWK9SZop1hMgmXIRWLsRot94kR-Q1TERbh-a6werc6IFnV6MGhYOXZ1Q7saiibEs0dOTTwC5KzFGqjuUCU";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get the FCM token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, { vapidKey: vapidKey });
      if (currentToken) {
        try {
          await api.post("/save-fcm-token", { fcm_token: currentToken });
          console.log("FCM token saved on backend successfully.");
        } catch (error) {
          console.error("Failed to save FCM token on backend:", error);
        }
        return currentToken;
      } else {
        console.warn("No FCM registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (err) {
    toast.error("Error with push notifications: " + err.message);
    return null;
  }
};

// Listen for notifications in foreground
export const onMessageListener = () =>
  onMessage(messaging, (payload) => {
    console.log("New foreground notification:", payload);
    // Use a toast library to show the notification to the user
    toast.info(payload.notification.body, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  });
