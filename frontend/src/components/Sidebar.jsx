import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, UserCircle, BarChart3, User, LogOut, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../css/Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/user/leads', icon: Users, label: 'Leads' },
    user?.role === 'admin' && { path: '/user/agents', icon: UserCircle, label: 'Agents' },
    { path: '/user/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/user/notifications', icon: Bell, label: 'Notifications' },
    { path: '/user/profile', icon: User, label: 'Profile' },
  ].filter(Boolean); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/user" className="sidebar-logo">
          <Users className="logo-icon-sidebar" />
          {!isCollapsed && <span className="logo-text">Lead Manager</span>}
        </Link>
        <button 
          onClick={onToggle} 
          className="sidebar-toggle-btn"
          title={isCollapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="sidebar-item">
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} className="sidebar-link-icon" />
                  {!isCollapsed && <span className="sidebar-link-text">{item.label}</span>}
                  {isCollapsed && (
                    <span className="sidebar-link-tooltip">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={20} className="logout-icon" />
          {!isCollapsed && <span className="logout-text">Déconnexion</span>}
          {isCollapsed && (
            <span className="sidebar-link-tooltip">Déconnexion</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
