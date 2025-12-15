import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/AgentForm.css';
import { getAgentById, updateAgent } from '../api/agentApi';

const AgentUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const agent = await getAgentById(id);
        setFormData({
          name: agent.name || '',
          email: agent.email || '',
          role: agent.role || 'agent',
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Impossible de charger cet agent.' });
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      setSaving(true);
      await updateAgent(id, payload);
      setStatus({ type: 'success', message: 'Agent mis à jour avec succès.' });
      navigate(-1);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Impossible de mettre à jour cet agent.' });
    } finally {
      setSaving(false);
    }
  };
      useEffect(() => {
        if (status) {
          const timer = setTimeout(() => setStatus(null), 4000); 
          return () => clearTimeout(timer);
        }
      }, [status]);

  return (
    <DashboardLayout>
      <div className="agent-form-page">



        
        <div className="agent-info-header">
          <h2 className="page-title">Modifier l'Agent</h2>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
        <form onSubmit={handleSubmit} className="agent-form">
          {status && (
            <div className={`toast ${status.type}`}>
              <span>{status.message}</span>
              <button className="toast-close" onClick={() => setStatus(null)}>×</button>
            </div>
          )}
          <div className="form-section">
            <div className="section-header">
              <User size={20} />
              <h3 className="section-title">Informations personnelles</h3>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nom complet *
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="jean.dupont@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Lock size={20} />
              <h3 className="section-title">Sécurité</h3>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Nouveau mot de passe (laisser vide pour ne pas modifier)
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                  />
                </div>
              </div>
              {formData.password && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength="6"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentUpdate;

