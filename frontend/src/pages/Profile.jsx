import React, { useEffect, useMemo, useState } from 'react';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Profile.css';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/userApi';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, loading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setStatus(null);

    if (formData.newPassword && formData.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
    };

    if (formData.newPassword) {
      payload.password = formData.newPassword;
    }

    try {
      setSaving(true);
      await updateProfile(payload);
      await refreshProfile();
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès.' });
      setFormData((prev) => ({
        ...prev,
        newPassword: '',
      }));
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue lors de la mise à jour.' });
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


  const displayUser = useMemo(() => user ?? {}, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!displayUser?._id) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <p>Impossible de charger vos informations. Veuillez vous reconnecter.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="page-title">Mon Profil</h2>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <span>{(displayUser.name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="profile-info-header">
                <h3 className="profile-name">{displayUser.name}</h3>
                <span className={`profile-role ${displayUser.role}`}>
                  {displayUser.role === 'admin' ? 'Administrateur' : 'Agent'}
                </span>
                <p className="profile-email">{displayUser.email}</p>
                <p className="profile-joined">
                  Membre depuis {new Date(displayUser.createdAt || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          {status && (
            <div className={`toast ${status.type}`}>
              <span>{status.message}</span>
              <button className="toast-close" onClick={() => setStatus(null)}>×</button>
            </div>
          )}


          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h3 className="section-title">Informations personnelles</h3>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Nom complet
                  </label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={20} />
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
            </div>

            <div className="form-section">
              <div className="section-header">
                <Shield size={20} />
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
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
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

export default Profile;

