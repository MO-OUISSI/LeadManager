import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, Moon, Sun, Search, MessageSquare, Edit, Trash2, X } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { listNotifications } from '../api/notificationApi';
import { listLeads, deleteLead } from '../api/leadsApi';
import Notes from './Notes';
import '../css/TopNavbar.css';

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);


  const loadNotifications = async () => {
    try {
      const notifications = await listNotifications();
      const unread = notifications.filter(n => n.statut === false).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadLeads = async () => {
    try {
      const data = await listLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadLeads();

    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = leads.filter(lead => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = `${lead.prenom} ${lead.nom}`.toLowerCase().includes(searchLower);
        const phoneMatch = lead.telephone?.includes(searchTerm);
        return nameMatch || phoneMatch;
      });
      setSearchResults(filtered.slice(0, 5)); 
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchTerm, leads]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShowNotes = (leadId) => {
    setSelectedLeadId(leadId);
    setShowNotes(true);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleEdit = (leadId) => {
    navigate(`/user/leads/${leadId}/edit`);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return;
    try {
      setDeletingId(leadId);
      await deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead._id !== leadId));
      setSearchResults(prev => prev.filter(lead => lead._id !== leadId));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer ce lead.');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getEtatColor = (etat) => {
    const palette = {
      light: {
        'Nouveau': { bg: '#E0F2FE', text: '#0369A1' },
        'En cours': { bg: '#FEF3C7', text: '#B45309' },
        'Qualifié': { bg: '#DCFCE7', text: '#15803D' },
        'Non qualifié': { bg: '#FEE2E2', text: '#B91C1C' },
        'Gagné': { bg: '#E0E7FF', text: '#4338CA' },
        'Perdu': { bg: '#E5E7EB', text: '#374151' },
        default: { bg: '#E5E7EB', text: '#374151' },
      },
      dark: {
        'Nouveau': { bg: '#082F49', text: '#7DD3FC' },
        'En cours': { bg: '#422006', text: '#FACC15' },
        'Qualifié': { bg: '#052E16', text: '#4ADE80' },
        'Non qualifié': { bg: '#450A0A', text: '#FCA5A5' },
        'Gagné': { bg: '#1E1B4B', text: '#A5B4FC' },
        'Perdu': { bg: '#1F2937', text: '#D1D5DB' },
        default: { bg: '#1F2937', text: '#D1D5DB' },
      }
    };
    const scheme = isDarkMode ? 'dark' : 'light';
    return palette[scheme][etat] || palette[scheme].default;
  };

  return (
    <nav className="top-navbar">
      <div className="top-navbar-container">

        <div className="top-navbar-left" ref={searchRef}>
          <div className="navbar-search-wrapper">
            <Search className="navbar-search-icon" size={18} />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Rechercher Leads par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim().length > 0 && setIsSearchOpen(true)}
            />
            {searchTerm && (
              <button
                className="navbar-search-clear"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchOpen(false);
                }}
              >
                <X size={16} />
              </button>
            )}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="navbar-search-dropdown" ref={dropdownRef}>
                <div className="search-dropdown-header">
                  <span className="search-results-count">{searchResults.length} résultat(s)</span>
                </div>
                <div className="search-dropdown-list">
                  {searchResults.map((lead) => (
                    <div key={lead._id} className="search-result-item">
                      <div className="search-result-info">
                        <div className="search-result-header">
                          <div className="search-result-name">
                            {lead.prenom} {lead.nom}
                          </div>
                          {lead.etat && (
                            <span 
                              className="search-result-status"
                              style={{
                                backgroundColor: getEtatColor(lead.etat).bg,
                                color: getEtatColor(lead.etat).text,
                              }}
                            >
                              {lead.etat}
                            </span>
                          )}
                        </div>
                        <div className="search-result-phone">{lead.telephone}</div>
                      </div>
                      <div className="search-result-actions">
                        <button
                          onClick={() => handleShowNotes(lead._id)}
                          className="search-action-btn search-action-notes"
                          title="Notes"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(lead._id)}
                          className="search-action-btn search-action-edit"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="search-action-btn search-action-delete"
                          title="Supprimer"
                          disabled={deletingId === lead._id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isSearchOpen && searchTerm.trim().length > 0 && searchResults.length === 0 && (
              <div className="navbar-search-dropdown" ref={dropdownRef}>
                <div className="search-dropdown-empty">
                  Aucun résultat trouvé
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="top-navbar-right">
          <div className="top-navbar-icons-group">
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
          </div>

          <div className="top-navbar-separator"></div>

          <Link to="/user/profile" className="user-profile-link" title="Profile">
            <div className="user-avatar">
              {user ? (
                <span className="user-avatar-initials">
                  {getInitials(user.name || user.email)}
                </span>
              ) : (
                <User size={18} />
              )}
            </div>
            {user && (
              <div className="user-profile-info">
                <div className="user-profile-name">
                  {user.name || user.email?.split('@')[0]}
                </div>
                <div className={`user-profile-role role-${user.role}`}>
                  {user.role === 'admin' ? 'Administrateur' : 'Agent'}
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
      {showNotes && selectedLeadId && (
        <Notes
          leadId={selectedLeadId}
          onClose={() => {
            setShowNotes(false);
            setSelectedLeadId(null);
          }}
        />
      )}
    </nav>
  );
};

export default TopNavbar;
