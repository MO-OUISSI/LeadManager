import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Bell, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Settings.css';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/userApi';
import Loading from '../components/Loading';

const Settings = () => {
  const { user, loading, refreshProfile } = useAuth();
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    notifications: true,
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setStatus(null);

    if (password && password.length < 6) {
      setStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    const payload = {
      name: formData.fullName.trim(),
      email: formData.email.trim(),
    };

    if (password) {
      payload.password = password;
    }

    try {
      setSaving(true);
      await updateProfile(payload);
      await refreshProfile();
      setStatus({ type: 'success', message: 'Paramètres enregistrés avec succès.' });
      setPassword('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h2 className="page-title">Paramètres</h2>
          <p className="page-subtitle">Gérez vos préférences et votre compte</p>
        </div>

        <div className="settings-content">
          {loading && <Loading />}
          {status && (
            <div className={`settings-alert ${status.type}`}>
              {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="settings-form">
            
            <div className="settings-section">
              <div className="section-header">
                <User size={20} />
                <h3 className="section-title">Informations du profil</h3>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                      required
                  />
                </div>
              </div>
            </div>

            
            <div className="settings-section">
              <div className="section-header">
                <Lock size={20} />
                <h3 className="section-title">Sécurité</h3>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>
            </div>

           
            <div className="settings-section">
              <div className="section-header">
                <Bell size={20} />
                <h3 className="section-title">Préférences</h3>
              </div>
              <div className="section-content">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Activer les notifications</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || loading}>
                <Save size={18} />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

