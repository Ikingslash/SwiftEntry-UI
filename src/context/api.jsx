import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000/api/",
  baseURL: "https://api.theswiftentry.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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
