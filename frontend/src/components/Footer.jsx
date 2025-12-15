import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Lead Manager. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

