// src/context/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem('token'); // Your auth token

const echo = new Echo({
  broadcaster: 'pusher',
  key: '8a728cd26ae422539269', // Hardcoded Pusher key
  cluster: 'ap2', // Hardcoded Pusher cluster
  forceTLS: true,
  authEndpoint: 'https://vms.194.62.99.202.sslip.io/broadcasting/auth', // Hardcoded API base URL
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  },
});

export default echo;
