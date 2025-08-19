import axios from "axios";

const api = axios.create({
  baseURL: "https://vms-api.85.9.202.212.nip.io/api",
  withCredentials: true, // Allows cookies & authentication
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Optional: Attach Bearer token automatically if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
