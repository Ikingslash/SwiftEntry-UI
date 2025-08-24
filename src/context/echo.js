// src/context/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  wsHost: import.meta.env.VITE_ECHO_HOST.replace(/^https?:\/\//, ""),
  wsPort: import.meta.env.VITE_ECHO_PORT,
  wssPort: import.meta.env.VITE_ECHO_PORT,
  forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS === "true",
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  authEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },
});

export default echo;
