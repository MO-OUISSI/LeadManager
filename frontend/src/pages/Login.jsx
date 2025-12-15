import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../css/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  if (isAuthenticated) {
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
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/user');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </Link>
          <div className="login-header">
            <div className="login-icon-wrapper">
              <LogIn className="login-icon" />
            </div>
            <h1 className="login-title">Connexion</h1>
            <p className="login-subtitle">Connectez-vous à votre compte</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
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
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <LogIn size={18} />
              <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="login-link">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

