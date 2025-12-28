import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../css/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { adminExists, checkAdminExists, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      if (location.hash === '#Accueil') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [location]);

  useEffect(() => {
    
    if (adminExists === null) {
      checkAdminExists();
    }
  }, [adminExists, checkAdminExists]);

  const navLinks = [
    { path: '/#Accueil', label: 'Accueil' },
    { path: '/#features', label: 'Features' },
    { path: '/#about', label: 'About' },
    { path: '/#contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Users className="logo-icon" />
          <span>Lead Manager</span>
        </Link>

        <ul className="navbar-center-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                className={location.hash === link.path.substring(1) || (link.path === '/#Accueil' && location.hash === '') ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="navbar-actions">
          <Link to="/login" className="btn-login">
            <LogIn size={18} />
            <span>Connexion</span>
          </Link>
          {!authLoading && adminExists === false && (
            <Link to="/register" className="btn-register">
              <UserPlus size={18} />
              <span>Créer Admin</span>
            </Link>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
