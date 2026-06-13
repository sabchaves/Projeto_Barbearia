import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Scissors } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Register = () => {
  useDocumentTitle('Criar Conta');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!name || !email || !password || !confirmPassword) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
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
          <p>Cadastre-se na Plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Seu nome profissional"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email de Trabalho</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="seuemail@cabeludos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha (mín. 6 caracteres)</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Crie sua senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já possui cadastro? <Link to="/login" className="auth-link">Entre por aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
