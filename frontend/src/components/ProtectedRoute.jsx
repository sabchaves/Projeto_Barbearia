//Um componente especial que envolve as páginas privadas (como o Dashboard), 
// impedindo que pessoas não logadas acessem a tela digitando a URL direta.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)',
        gap: '1rem'
      }}>
        <div className="spinner spinner-primary" style={{ width: '40px', height: '40px' }} />
        <span>Autenticando sessão...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
