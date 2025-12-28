import React, { useEffect, useState } from 'react';
import { X, Check, Calendar, MessageSquare, Edit, Trash2, Sparkles, Clock, Trophy, XCircle, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Dashboard.css';
import { listLeads, deleteLead } from '../api/leadsApi';
import { useDarkMode } from '../contexts/DarkModeContext';
import Loading from '../components/Loading';
import Notes from '../components/Notes';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await listLeads();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const enCours = leads.filter(l => l.etat === 'En cours').length;
  const qualifies = leads.filter(l => l.etat === 'Qualifié').length;

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const stats = [
    { 
      label: 'Total Leads', 
      value: totalLeads, 
      percentage: 100,
      icon: Users, 
      isPrimary: true,
      color: isDarkMode ? '#ffffffff' : '#ffffffff'
    },
    { 
      label: 'Qualifiés', 
      value: qualifies, 
      percentage: calculatePercentage(qualifies, totalLeads),
      icon: Check, 
      isPrimary: false,
      color: isDarkMode ? '#4ADE80' : '#15803D' 
    },
    { 
      label: 'En cours', 
      value: enCours, 
      percentage: calculatePercentage(enCours, totalLeads),
      icon: Clock, 
      isPrimary: false,
      color: isDarkMode ? '#FACC15' : '#B45309' 
    },
  ];

  const etatList = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];

  const etatDistribution = etatList.map((etat) => {
    const count = leads.filter(l => l.etat === etat).length;
    const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
    return { etat, count, percentage };
  });

  // Find the next upcoming RDVs grouped by date
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to midnight for proper date comparison
  
  const upcomingRDVs = leads
    .filter(lead => lead.dateProchainRDV)
    .map(lead => {
      const rdvDate = new Date(lead.dateProchainRDV);
      rdvDate.setHours(0, 0, 0, 0);
      return {
        ...lead,
        dateProchainRDV: rdvDate
      };
    })
    .filter(lead => lead.dateProchainRDV >= now)
    .sort((a, b) => a.dateProchainRDV - b.dateProchainRDV);

  // Group RDVs by date and get the next date's RDVs
  const rdvsByDate = upcomingRDVs.reduce((acc, lead) => {
    const dateKey = lead.dateProchainRDV.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lead);
    return acc;
  }, {});

  const nextDateKey = Object.keys(rdvsByDate).sort()[0];
  const nextRDVs = nextDateKey ? rdvsByDate[nextDateKey] : [];
  const nextRDVDate = nextDateKey ? new Date(nextDateKey) : null;

  const handleShowNotes = (leadId) => {
    setSelectedLeadId(leadId);
    setShowNotes(true);
  };

  const handleEdit = (leadId) => {
    navigate(`/user/leads/${leadId}/edit`);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return;
    try {
      setDeletingId(leadId);
      await deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead._id !== leadId));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer ce lead.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Tableau de bord</h2>
          <p className="dashboard-subtitle">Vue d'ensemble de vos leads et activités</p>
        </div>

        
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = stat.label === 'Qualifiés' 
              ? getEtatColor('Qualifié')
              : stat.label === 'En cours'
              ? getEtatColor('En cours')
              : null;
            
            const iconColor = colors ? colors.text : stat.color;
            const iconBgColor = colors ? colors.bg : (isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)');
            
            return (
              <div 
                key={index} 
                className={`stat-card ${stat.isPrimary ? 'stat-card-primary' : ''}`}
              >
                <div
                  className="stat-icon-wrapper"
                  style={{ 
                    backgroundColor: iconBgColor,
                    background: stat.isPrimary 
                      ? `linear-gradient(135deg, ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)'}, ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.08)'})`
                      : iconBgColor
                  }}
                >
                  <Icon size={stat.isPrimary ? 28 : 24} style={{ color: iconColor }} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <div className="stat-percentage">
                    <div className="stat-percentage-bar">
                      <div 
                        className="stat-percentage-fill"
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.isPrimary 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : colors ? colors.text : stat.color
                        }}
                      ></div>
                    </div>
                    <span className="stat-percentage-text">{stat.percentage}%</span>
                  </div>
                </div>
                {stat.isPrimary && (
                  <div className="stat-card-decoration"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="dashboard-grid">
          <div className="analytics-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Distribution par état</h3>
              <button 
                onClick={() => navigate('/user/analytics')}
                className="chart-see-all-btn"
                title="Voir tous les détails"
              >
                <span>Voir tout</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="chart-content">
              <div className="state-distribution">
                {etatDistribution.map((item, index) => (
                  <div key={index} className="distribution-item">
                    <div className="distribution-header">
                      <span className="distribution-state">{item.etat}</span>
                      <span className="distribution-count">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: getEtatColor(item.etat).text
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {nextRDVs.length > 0 && nextRDVDate && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <div className="chart-header-content">
                  <h3 className="chart-title">Prochain RDV</h3>
                </div>
                <div className="chart-header-date">
                  {nextRDVDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                  {nextRDVs.length > 1 && (
                    <span className="rdv-count-badge">{nextRDVs.length} rendez-vous</span>
                  )}
                </div>
              </div>
              <div className="chart-content">
                <div className="rdv-list">
                  {nextRDVs.map((rdv, index) => (
                    <div 
                      key={rdv._id} 
                      className="rdv-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="rdv-item-avatar">
                        {rdv.prenom.charAt(0)}{rdv.nom.charAt(0)}
                      </div>
                      <div className="rdv-item-info">
                        <span className="rdv-item-name">
                          {rdv.prenom} {rdv.nom}
                        </span>
                        {rdv.telephone && (
                          <span className="rdv-item-phone">{rdv.telephone}</span>
                        )}
                      </div>
                      <div 
                        className="rdv-item-badge"
                        style={{
                          backgroundColor: getEtatColor(rdv.etat).bg,
                          color: getEtatColor(rdv.etat).text,
                        }}
                      >
                        {rdv.etat}
                      </div>
                      <div className="rdv-item-actions">
                        <button 
                          onClick={() => handleShowNotes(rdv._id)} 
                          className="action-btn show-btn" 
                          title="Notes"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(rdv._id)} 
                          className="action-btn edit-btn" 
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(rdv._id)} 
                          className="action-btn delete-btn" 
                          title="Supprimer" 
                          disabled={deletingId === rdv._id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
    </DashboardLayout>
  );
};

export default Dashboard;