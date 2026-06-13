import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, UserCheck } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('Acesso ao Sistema');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // 'client' or 'admin'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--primary-purple)' }}>
              <path d="M30 15 h40 v8 h-40 z" fill="currentColor"/>
              <path d="M33 8 v7 h4 v-7 z" fill="currentColor"/>
              <path d="M41 8 v7 h4 v-7 z" fill="currentColor"/>
              <path d="M49 8 v7 h4 v-7 z" fill="currentColor"/>
              <path d="M57 8 v7 h4 v-7 z" fill="currentColor"/>
              <path d="M65 8 v7 h4 v-7 z" fill="currentColor"/>
              <path d="M25 26 l5 3 v8 l-5 -3 z" fill="currentColor" opacity="0.7"/>
              <path d="M32 23 L37 82 C38 86, 62 86, 63 82 L68 23 Z" fill="currentColor"/>
              <rect x="46" y="40" width="8" height="18" rx="4" fill="var(--bg-app, #09080e)" opacity="0.6"/>
              <circle cx="50" cy="46" r="3" fill="currentColor"/>
            </svg>
          </div>
          <h1>Cabeludo's</h1>
          <p>Barbearia Premium & Club</p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="role-selector" style={{
          display: 'flex',
          background: 'var(--bg-input, rgba(255,255,255,0.02))',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => setRole('client')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'var(--transition-smooth)',
              background: role === 'client' ? 'var(--primary-purple, #d4af37)' : 'transparent',
              color: role === 'client' ? '#050408' : 'var(--text-secondary)'
            }}
          >
            Entrar como Cliente
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'var(--transition-smooth)',
              background: role === 'admin' ? 'var(--primary-purple, #d4af37)' : 'transparent',
              color: role === 'admin' ? '#050408' : 'var(--text-secondary)'
            }}
          >
            Entrar como Administrador
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail de Acesso</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem um login? <Link to="/register" className="auth-link">Cadastre-se aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
