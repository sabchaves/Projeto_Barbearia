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
          <Scissors size={20} className="purple-icon" />
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
