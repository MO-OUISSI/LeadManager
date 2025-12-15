import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Calendar, Shield, Users, Phone, TrendingUp, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/AgentInfo.css';
import { getAgentById, deleteAgent } from '../api/agentApi';
import Loading from '../components/Loading';

const AgentInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const data = await getAgentById(id);
        setAgent(data);
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Impossible de charger cet agent.' });
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cet agent ?')) {
      return;
    }

    try {
      setStatus(null);
      await deleteAgent(id);
      navigate('/user/agents');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Impossible de supprimer cet agent.' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="agent-info-page">
          <p>Agent introuvable.</p>
          {status?.message && <p className="agent-info-error">{status.message}</p>}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="agent-info-page">
        <div className="agent-info-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <div>
            <button className="btn btn-primary" id='delete_one' onClick={handleDelete}>
              <Trash2 size={18} />
              <span>Supprimer</span>
            </button>
            <button onClick={() => navigate(`/user/agents/${id}/edit`)} className="btn btn-primary">
              <Edit size={18} />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        {status && (
          <div className={`agent-info-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="agent-info-content">
          <div className="agent-info-card">
            <div className="agent-header">
              <div className="agent-avatar">
                <span>{agent.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="agent-title-section">
                <h1 className="agent-name">{agent.name}</h1>
                <span
                  className={`agent-role-badge ${agent.role}`}
                >
                  {agent.role === 'admin' ? 'Administrateur' : 'Agent'}
                </span>
              </div>
            </div>

            <div className="agent-details">
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <User size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Nom complet</p>
                      <p className="detail-value">{agent.name}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Mail size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Email</p>
                      <p className="detail-value">{agent.email}</p>
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
                        {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Shield size={20} className="detail-icon" />
                    <div className="detail-content">
                      <p className="detail-label">Rôle</p>
                      <p className="detail-value">{agent.role === 'admin' ? 'Administrateur' : 'Agent'}</p>
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

export default AgentInfo;

