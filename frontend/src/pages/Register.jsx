import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Scissors } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Google account selection simulation modal
const GoogleSimulatedSelector = ({ isOpen, onClose, onSelect }) => {
  const [customEmail, setCustomEmail] = useState('');
  
  if (!isOpen) return null;

  const mockGoogleAccounts = [
    { name: 'Marcos Rangel', email: 'marcos.rangel@gmail.com', avatar: 'MR' },
    { name: 'Diego Alcântara', email: 'diego.alcantara@gmail.com', avatar: 'DA' },
    { name: 'Cliente de Teste', email: 'cliente.teste@gmail.com', avatar: 'CT' }
  ];

  const handleCustomEmailSubmit = (e) => {
    e.preventDefault();
    if (customEmail && customEmail.includes('@')) {
      onSelect(customEmail.toLowerCase());
    }
  };

  return (
    <div className="google-select-overlay" onClick={onClose}>
      <div className="google-select-modal" onClick={(e) => e.stopPropagation()}>
        <div className="google-select-header">
          <div className="google-select-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <h2 className="google-select-title">Fazer login com o Google</h2>
          <p className="google-select-subtitle">para continuar em Cabeludo's</p>
        </div>
        <div className="google-select-body">
          {mockGoogleAccounts.map((account, idx) => (
            <button
              key={idx}
              className="google-account-item"
              onClick={() => onSelect(account.email)}
            >
              <div className="google-account-avatar">{account.avatar}</div>
              <div className="google-account-info">
                <span className="google-account-name">{account.name}</span>
                <span className="google-account-email">{account.email}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="google-select-footer">
          <form onSubmit={handleCustomEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="email"
              placeholder="Ou digite outro email para simular..."
              className="google-custom-email-input"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              required
            />
            <button type="submit" className="google-custom-email-btn">
              Usar Este Email
            </button>
          </form>
          <button className="google-select-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  useDocumentTitle('Criar Conta');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const { register, loginWithGoogle, user, showToast } = useAuth();
  const navigate = useNavigate();

  // Redirect automatically if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSelect = async (selectedEmail) => {
    setIsSimulationOpen(false);
    setIsSubmitting(true);
    const mockToken = `mock_google_token_${selectedEmail}`;
    const result = await loginWithGoogle(mockToken);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleClick = () => {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isMock = !clientID || clientID === 'YOUR_GOOGLE_CLIENT_ID';

    if (isMock) {
      setIsSimulationOpen(true);
    } else {
      try {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientID,
            callback: async (response) => {
              setIsSubmitting(true);
              const result = await loginWithGoogle(response.credential);
              setIsSubmitting(false);
              if (result.success) {
                navigate('/dashboard');
              }
            }
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              setIsSimulationOpen(true);
            }
          });
        } else {
          setIsSimulationOpen(true);
        }
      } catch (err) {
        setIsSimulationOpen(true);
      }
    }
  };

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

        <div className="auth-divider">OU continuar com</div>

        <button type="button" onClick={handleGoogleClick} className="google-btn" disabled={isSubmitting}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <GoogleSimulatedSelector
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          onSelect={handleGoogleSelect}
        />

        <div className="auth-footer">
          <p>Já possui cadastro? <Link to="/login" className="auth-link">Entre por aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
