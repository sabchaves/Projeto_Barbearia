//Configuração centralizada do Axios. É aqui que você define que o frontend deve 
//sempre enviar requisições para a URL do backend (http://localhost:5000/api). Ele também anexa 
// o token JWT automaticamente em cada chamada após o login.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
