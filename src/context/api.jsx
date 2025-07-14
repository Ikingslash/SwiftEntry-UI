import axios from "axios";

const api = axios.create({
  baseURL: "git/api",
  withCredentials: true, // Allows cookies & authentication
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export default api;
