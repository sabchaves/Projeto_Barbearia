import React from 'react';
import { LayoutDashboard, CalendarPlus, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();

  const menuItems = [];
  if (user?.role === 'admin') {
    menuItems.push(
      { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
      { id: 'bookings', label: 'Agendamentos', icon: CalendarPlus },
      { id: 'reports', label: 'Relatórios Semanais', icon: BarChart3 }
    );
  } else {
    menuItems.push(
      { id: 'bookings', label: 'Meus Agendamentos', icon: CalendarPlus }
    );
  }

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <IconComponent size={20} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-item logout-item">
          <LogOut size={20} className="sidebar-icon" />
          <span className="sidebar-label">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
