import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../css/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerAdmin, adminExists, checkAdminExists, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    
    if (adminExists === null) {
      checkAdminExists();
    } else if (adminExists === true) {
      navigate('/login');
    }
  }, [adminExists, checkAdminExists, navigate]);

 
  if (authLoading || adminExists === null) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>
        </div>
      </div>
    );
  }

 
  if (adminExists === true) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    const result = await registerAdmin({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      alert('Compte admin créé avec succès! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }
    
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </Link>
          <div className="register-header">
            <div className="register-icon-wrapper">
              <UserPlus className="register-icon" />
            </div>
            <h1 className="register-title">Inscription</h1>
            <p className="register-subtitle">Créez votre compte</p>
          </div>
          
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error-message" style={{ 
                color: 'red', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#fee', 
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

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
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
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
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
            </div>

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
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <UserPlus size={18} />
              <span>{loading ? 'Inscription...' : 'S\'inscrire'}</span>
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Register;

