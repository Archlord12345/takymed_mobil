import axios from 'axios';

const BASE_URL = 'http://dev.takymed.com:3500'; // Based on .env.example

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
