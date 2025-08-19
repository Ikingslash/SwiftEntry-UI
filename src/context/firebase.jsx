// src/context/firebase.jsx

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api";
import { toast } from "react-toastify";

// It's a best practice to load these from environment variables in a real app
// NOTE: These are your firebaseConfig values from your uploaded files.
const firebaseConfig = {
  apiKey: "AIzaSyC0exeQOxXe08I2ydDbNNmAa_86YgB-yKk",
  authDomain: "guest-management-63e17.firebaseapp.com",
  projectId: "guest-management-63e17",
  storageBucket: "guest-management-63e17.firebasestorage.app",
  messagingSenderId: "695608027119",
  appId: "1:695608027119:web:949901f351c62ee540781a",
  measurementId: "G-ZF4MTBLW8Z",
};

// This VAPID key is crucial for associating your app with your Firebase project
const vapidKey =
  "BDUV_IWK9SZop1hMgmXIRWLsRot94kR-Q1TERbh-a6werc6IFnV6MGhYOXZ1Q7saiibEs0dOTTwC5KzFGqjuUCU";

// Init Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission & get token
export const requestForToken = async () => {
  try {
    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: vapidKey });
      if (token) {
        console.log("User FCM Token:", token);
        // Send this token to your Laravel backend to store in DB
        const response = await api.post(`/staff/save-fcm-token`, {
          fcm_token: token,
        });

        if (response.status === 200) {
          console.log("FCM token saved successfully!");
        } else {
          console.error("Failed to save FCM token to backend.");
        }
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
      }
    } else {
      console.log("Notification permission not granted.");
    }
  } catch (err) {
    console.error(
      "An error occurred while retrieving token or saving to backend.",
      err
    );
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
