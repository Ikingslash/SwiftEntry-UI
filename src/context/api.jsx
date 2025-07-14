import axios from "axios";

const api = axios.create({
  baseURL: "https://vms-api.85.9.202.212.nip.io/api",
  withCredentials: true, // Allows cookies & authentication
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export default api;
