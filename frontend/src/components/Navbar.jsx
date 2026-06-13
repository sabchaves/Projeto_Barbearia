import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Scissors } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--primary-purple)' }}>
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
        <span className="brand-name">Cabeludo's</span>
        <span className="brand-tag">Premium Barbershop</span>
      </div>

      <div className="navbar-right">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-btn" 
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="theme-icon sun-icon" />
          ) : (
            <Moon size={20} className="theme-icon moon-icon" />
          )}
        </button>

        {user && (
          <div className="user-profile-box">
            <div className="avatar-bubble">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">Profissional</span>
            </div>
            <button onClick={logout} className="logout-btn" title="Sair da conta">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
