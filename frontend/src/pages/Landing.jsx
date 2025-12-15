import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Phone, Calendar, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../css/Landing.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: 'easeOut' },
  }),
};

const Landing = () => {
  const { adminExists, checkAdminExists, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user', { replace: true });
      return;
    }

    if (adminExists === null) {
      checkAdminExists();
    }
  }, [adminExists, checkAdminExists, isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="landing">
      <section className="landing-hero">
        <motion.div 
          className="landing-content"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.div className="hero-badge" variants={fadeInUp} custom={0.1}>
            <CheckCircle2 size={18} />
            <span>Solution professionnelle de gestion de leads</span>
          </motion.div>

          <motion.h1 className="landing-title" variants={fadeInUp} custom={0.2}>
            Gérez vos leads <span className="highlight">efficacement</span>
          </motion.h1>

          <motion.p className="landing-description" variants={fadeInUp} custom={0.3}>
            Une plateforme intuitive pour suivre vos prospects, appels et rendez-vous 
            conçue pour les équipes modernes.
          </motion.p>

          <motion.div 
            className="landing-buttons" 
            variants={fadeInUp} 
            custom={0.4}
          >
            {!authLoading && adminExists === false && (
              <Link to="/register" className="btn-primary1">
                <span>Créer un compte Administrateur</span>
              </Link>
            )}
            <Link to="/login" className="btn-secondary2">
              <span>Se connecter</span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="gradient-orb orb1"></div>
        <div className="gradient-orb orb2"></div>
      </section>

      <section id="features" className="landing-features">
        <div className="container">
          <motion.div
            className="features-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="features-title">Fonctionnalités principales</h2>
            <p className="features-subtitle">Tout ce dont vous avez besoin pour gérer vos leads</p>
          </motion.div>

          <div className="features-grid">
            {[
              { icon: <Users />, title: 'Gestion des leads', desc: 'Créez et suivez tous vos prospects facilement.' },
              { icon: <Phone />, title: 'Suivi des appels', desc: 'Gardez l’historique complet de vos communications.' },
              { icon: <Calendar />, title: 'Rendez-vous', desc: 'Planifiez vos réunions et soyez toujours prêt.' },
              { icon: <BarChart3 />, title: 'Statistiques', desc: 'Analysez vos performances et taux de conversion.' },
            ].map((f, i) => (
              <motion.div
                className="feature-card"
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={0.1 * i}
              >
                <div className="feature-icon-wrapper">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="landing-section landing-about-bg">
        <div className="container">
          <motion.div
            className="features-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="features-title">À Propos de Nous</h2>
            <p className="features-subtitle">Notre mission et notre vision.</p>
          </motion.div>
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0.2}
          >
            <p>Lead Manager est né de la volonté de simplifier la gestion des prospects pour les entreprises de toutes tailles. Nous croyons qu'une gestion efficace des leads est la clé de la croissance et du succès commercial. Notre plateforme est conçue pour être intuitive, puissante et évolutive, vous permettant de vous concentrer sur ce qui compte le plus : vos clients.</p>
            <p>Nous nous engageons à fournir des outils innovants et un support exceptionnel pour aider nos utilisateurs à atteindre leurs objectifs. Rejoignez notre communauté et transformons ensemble votre processus de vente.</p>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="landing-section landing-contact-bg">
        <div className="container">
          <motion.div
            className="contact-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="contact-card-left">
              <h2 className="contact-title">Contactez-nous</h2>
              <p className="contact-description">
                Vous avez une question, un commentaire ou besoin d'aide ? N'hésitez pas à nous contacter.
              </p>
              <div className="contact-details">
                <p><strong>Email :</strong> contact@leadmanager.com</p>
                <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
              </div>
            </div>
            <div className="contact-card-right">
              <h3 className="contact-cta-title">Prêt à commencer ?</h3>
              <p className="contact-cta-text">Passez à la vitesse supérieure avec Lead Manager.</p>
              {!authLoading && adminExists === false && (
                <Link to="/register" className="btn-primary1">
                  Démarrer un essai gratuit
                </Link>
              )}
              {!authLoading && adminExists === true && (
                <Link to="/login" className="btn-primary1">
                  Se connecter
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
