import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, User, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { listNotifications } from '../api/notificationApi';
import { getProfile } from '../api/userApi';
import '../css/TopNavbar.css';

const TopNavbar = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);


  const loadNotifications = async () => {
    try {
      const notifications = await listNotifications();
      const unread = notifications.filter(n => n.statut === false).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };


  const loadUser = async () => {
    try {
      const data = await getProfile();
      setUser(data); 
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUser();

    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="top-navbar">
      <div className="top-navbar-container">

        <div className="top-navbar-left">
          {user && (
            <div className="user-info">
              <span className={`profile-role role-${user.role}`}>
                {user.role === 'admin' ? 'Administrateur' : 'Agent'}
              </span>
            </div>
          )}
        </div>


        
        <div className="top-navbar-right">

          
          <button
            onClick={toggleDarkMode}
            className="top-navbar-icon-btn"
            id="d_l"
            title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          
          <Link
            to="/user/notifications"
            className="top-navbar-icon-btn"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>


          
          <Link to="/user/profile" className="top-navbar-icon-btn" title="Profile">
            <User size={20} />
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
