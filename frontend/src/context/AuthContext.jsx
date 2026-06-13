import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Setup API URL
  const API_URL = 'http://localhost:5000/api';

  // Load user profile on mount or token change
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(res.data);
      } catch (err) {
        console.error('Sessão expirada ou inválida:', err.response?.data?.message || err.message);
        // Clean session
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        showToast('Sua sessão expirou, tente novamente.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  };

  // Login action
  const login = async (email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
      const { token: userToken, ...userData } = res.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      showToast('Bem-vindo de volta ao Cabeludo\'s!', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao efetuar login. Verifique os dados.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Register action
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      showToast('Cadastro realizado com sucesso!', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao realizar cadastro.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Login with Google action
  const loginWithGoogle = async (idToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { idToken });
      const { token: userToken, ...userData } = res.data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      showToast(`Bem-vindo, ${userData.name}!`, 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Não foi possível autenticar com o Google.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    showToast('Até logo! Sessão encerrada.', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        toasts,
        showToast,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
