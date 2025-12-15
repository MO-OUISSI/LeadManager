import React, { useEffect, useState } from 'react';
import { Clipboard, PlusCircle, Check, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Dashboard.css';
import { listLeads } from '../api/leadsApi';
import { useDarkMode } from '../contexts/DarkModeContext';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
  const nouveaus = leads.filter(l => l.etat === 'Nouveau').length;
  const qualifies = leads.filter(l => l.etat === 'Qualifié').length;

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Clipboard, color: '#216d69' },
    { label: 'Nouveaux', value: nouveaus, icon: PlusCircle, color: '#216d69' },
    { label: 'Qualifiés', value: qualifies, icon: Check, color: '#216d69' },
  ];

  const etatList = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];

  const etatDistribution = etatList.map((etat) => {
    const count = leads.filter(l => l.etat === etat).length;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return { etat, count, percentage };
  });

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    if (recentLeads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => {
        if (prev >= recentLeads.length - 1) {
          return 0; 
        }
        return prev + 1;
      });
    }, 4000); 

    return () => clearInterval(interval);
  }, [recentLeads.length, isPaused]);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  
  const nextCard = () => {
    setIsPaused(true);
    setCurrentCardIndex((prev) => 
      prev < recentLeads.length - 1 ? prev + 1 : prev
    );
    
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevCard = () => {
    setIsPaused(true);
    setCurrentCardIndex((prev) => 
      prev > 0 ? prev - 1 : 0
    );
    
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleViewDetails = (leadId) => {
    navigate(`/user/leads/${leadId}`);
  };

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
            return (
              <div key={index} className="stat-card">
                <div
                  className="stat-icon-wrapper"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-grid">
          
          <div className="analytics-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Distribution par état</h3>
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

          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="carousel-header">
                <h3 className="card-title">Leads récents</h3>
                <div className="carousel-counter">
                  {recentLeads.length > 0 && (
                    <span>{currentCardIndex + 1} / {recentLeads.length}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="card-content">
              {recentLeads.length > 0 ? (
                <div className="lead-carousel">
                  <div 
                    className="lead-card-container"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div 
                      className="lead-card-wrapper"
                      style={{
                        transform: `translateX(-${currentCardIndex * 100}%)`,
                        transition: 'transform 0.5s ease-in-out'
                      }}
                    >
                      {recentLeads.map((lead) => (
                        <div key={lead._id} className="lead-card">
                          <div className="lead-card-header">
                            <div className="lead-avatar">
                              {lead.prenom.charAt(0)}{lead.nom.charAt(0)}
                            </div>
                            <div className="lead-card-info">
                              <h4 className="lead-card-name">
                                {lead.prenom} {lead.nom}
                              </h4>
                              <p className="lead-card-phone">{lead.telephone}</p>
                            </div>
                          </div>
                          
                          <div className="lead-card-details">
                            {lead.dateDernierAppel && (
                              <div className="lead-detail-item">
                                <span className="detail-label">Dernier appel:</span>
                                <span className="detail-value">
                                  {new Date(lead.dateDernierAppel).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                            {lead.dateProchainRDV && (
                              <div className="lead-detail-item">
                                <span className="detail-label">Prochain RDV:</span>
                                <span className="detail-value">
                                  {new Date(lead.dateProchainRDV).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                            {!lead.dateDernierAppel && !lead.dateProchainRDV && (
                              <div className="lead-detail-item">
                                <span className="detail-label">Créé le:</span>
                                <span className="detail-value">
                                  {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="lead-card-footer">
                            <div
                              className="lead-state-badge"
                              style={{
                                backgroundColor: getEtatColor(lead.etat).bg,
                                color: getEtatColor(lead.etat).text,
                              }}
                            >
                              {lead.etat}
                            </div>
                            <button
                              className="view-details-btn"
                              onClick={() => handleViewDetails(lead._id)}
                            >
                              <ExternalLink size={16} />
                              Voir détails
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="carousel-controls">
                    <button
                      className="carousel-btn"
                      onClick={prevCard}
                      disabled={currentCardIndex === 0}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="carousel-btn"
                      onClick={nextCard}
                      disabled={currentCardIndex === recentLeads.length - 1}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="no-leads-message">Aucun lead disponible</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;