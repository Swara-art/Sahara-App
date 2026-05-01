import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.88.154.145:8000',
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
