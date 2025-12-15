import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Trash2, Edit, Plus } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Notifications.css';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications, 
} from '../api/notificationApi';
import Loading from '../components/Loading';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await listNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentNotifications = notifications.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(notifications.length / perPage);

  
  const getNotificationIconAndColor = (message) => {
    const msg = message.toLowerCase();

    if (msg.includes('nouveau lead') || msg.includes('ajout')) {
      return { icon: <Plus size={18} />, color: '#22c55e' }; 
    }

    if (msg.includes('mis à jour') || msg.includes('update') || msg.includes('modifié')) {
      return { icon: <Edit size={18} />, color: '#3b82f6' }; 
    }

    if (msg.includes('supprimé') || msg.includes('deleted')) {
      return { icon: <Trash2 size={18} />, color: '#ef4444' }; 
    }

    return { icon: <Bell size={18} />, color: '#6b7280' };
  };

  
  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, statut: true } : n
      ));
    } catch (error) {
      console.error(error.message);
    }
  };

  
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, statut: true })));
    } catch (error) {
      console.error(error.message);
    }
  };

  
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error(error.message);
    }
  };

 
  const handleDeleteAll = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) return;

    try {
      await deleteAllNotifications();
      setNotifications([]); 
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.statut).length;

  return (
    <DashboardLayout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <h2 className="page-title">Notifications</h2>
            <p className="page-subtitle">
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues'
              }
            </p>
          </div>

          <div className="notificationsactions">
            {notifications.length > 0 && (
              <button onClick={handleDeleteAll} className="btn btn-secondary">
                <Trash2 size={18} />
                <span>Supprimer tout</span>
              </button>
            )}
            <div id="DeleteAll"></div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-secondary">
                <Check size={18} />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} className="empty-icon" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <>
                {currentNotifications.map(notification => {
                  const { icon, color } = getNotificationIconAndColor(notification.message);
                  const date = new Date(notification.dateNotification);

                  return (
                    <div
                      key={notification._id}
                      className={`notification-item ${notification.statut ? 'read' : 'unread'}`}
                    >
                      <div
                        className="notification-icon-wrapper"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <div style={{ color }}>
                          {icon}
                        </div>
                      </div>

                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <p className="notification-date">
                          {date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="notification-actions">
                        {!notification.statut && (
                          <button
                            onClick={() => handleMarkRead(notification._id)}
                            className="notification-action-btn"
                            title="Marquer comme lu"
                          >
                            <Check size={18} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="notification-action-btn delete"
                          title="Supprimer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                
                {notifications.length > perPage && (
                  <div className="pagination-wrapper">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Précédent
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
