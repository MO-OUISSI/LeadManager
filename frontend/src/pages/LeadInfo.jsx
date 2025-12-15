import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Calendar, User, Mail, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/LeadInfo.css';
import { getLeadById, deleteLead } from '../api/leadsApi';
import Loading from '../components/Loading';
import { useDarkMode } from '../contexts/DarkModeContext';

const LeadInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const data = await getLeadById(id);
        setLead(data);
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Impossible de charger ce lead.' });
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement ce lead ?')) {
      return;
    }

    try {
      setStatus(null);
      await deleteLead(id);
      navigate('/user/leads');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Impossible de supprimer ce lead.' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="lead-info-page">
          <p>Lead introuvable.</p>
          {status?.message && <p className="lead-info-error">{status.message}</p>}
        </div>
      </DashboardLayout>
    );
  }

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
        default: { bg: '#1F2937', text: '#D1D5DB' }
      }
    };
    const scheme = isDarkMode ? 'dark' : 'light';
    return palette[scheme][etat] || palette[scheme].default;
  };
  return (
    <DashboardLayout>
      <div className="lead-info-page">
        <div className="lead-info-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <div>
            <button className="btn btn-primary" id='delete_one' onClick={handleDelete}>
              <Trash2 size={18} />
              <span>Supprimer</span>
            </button>
            <button onClick={() => navigate(`/user/leads/${id}/edit`)} className="btn btn-primary">
              <Edit size={18} />
              <span>Modifier</span>
            </button>

          </div>
        </div>

        {status && (
          <div className={`lead-info-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="lead-info-content">
          <div className="lead-info-card">
            <div className="lead-header">
              <div className="lead-avatar">
                <span>{`${lead.prenom || ''}${lead.nom || ''}`.trim().slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="lead-title-section">
                <h1 className="lead-name">{lead.prenom} {lead.nom}</h1>
                <div className="lead-badges">
                  <span
                    className="lead-etat-badge"
                    style={{
                      backgroundColor: `${getEtatColor(lead.etat).bg}20`, 
                      color: getEtatColor(lead.etat).text
                    }}
                  >
                    {lead.etat}
                  </span>
                  <div className="lead-nf-badge">
                    <span className="lead-nf-label">NF</span>
                    <span className="lead-nf-value">{lead.NF ?? 0}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lead-details">
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <User size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Nom complet</p>
                      <p className="detail-value">{lead.prenom} {lead.nom}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Phone size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Téléphone</p>
                      <p className="detail-value">{lead.telephone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-grid">

                  <div className="detail-item">
                    <Calendar size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Dernier appel</p>
                      <p className="detail-value">
                        {lead.dateDernierAppel ? new Date(lead.dateDernierAppel).toLocaleDateString('fr-FR') : 'Aucun'}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Calendar size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Prochain rendez-vous</p>
                      <p className="detail-value">
                        {lead.dateProchainRDV
                          ? new Date(lead.dateProchainRDV).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                          : 'Aucun'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <Calendar size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Date de création</p>
                      <p className="detail-value">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Calendar size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Dernière modification</p>
                      <p className="detail-value">
                        {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <Phone size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Nombre d'appels</p>
                      <p className="detail-value">{lead.nbAppels ?? 0}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <User size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Agent</p>
                      <p className="detail-value">{lead.agent?.name || '—'}</p>
                      {lead.agent?.email && (
                        <p className="detail-email">
                          <Mail size={14} />
                          {lead.agent.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadInfo;

