import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/LeadForm.css';
import { getLeadById, updateLead } from '../api/leadsApi';

const LeadUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    nbAppels: 0,
    dateDernierAppel: '',
    dateProchainRDV: '',
    etat: 'Nouveau',
    NF: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const etats = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const lead = await getLeadById(id);
        setFormData({
          nom: lead.nom || '',
          prenom: lead.prenom || '',
          telephone: lead.telephone || '',
          nbAppels: lead.nbAppels ?? 0,
          dateDernierAppel: lead.dateDernierAppel ? lead.dateDernierAppel.slice(0, 10) : '',
          dateProchainRDV: lead.dateProchainRDV ? lead.dateProchainRDV.slice(0, 10) : '',
          etat: lead.etat || 'Nouveau',
          NF: lead.NF ?? 0,
        });
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Impossible de charger ce lead.' });
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
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

    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone.trim(),
      nbAppels: Number(formData.nbAppels) || 0,
      dateDernierAppel: formData.dateDernierAppel || null,
      dateProchainRDV: formData.dateProchainRDV || null,
      etat: formData.etat,
      NF: Number(formData.NF) || 0,
    };

    try {
      setSaving(true);
      await updateLead(id, payload);
      setStatus({ type: 'success', message: 'Lead mis à jour avec succès.' });
      navigate(-1);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Impossible de mettre à jour ce lead.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="lead-form-page">


        <div className="lead-info-header">
          <h2 className="page-title">Modifier le Lead</h2>

          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} className="lead-form">
            {status && (
              <div className={`lead-form-alert ${status.type}`}>
                {status.message}
              </div>
            )}
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h3 className="section-title">Informations personnelles</h3>
              </div>
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom" className="form-label">
                      Prénom *
                    </label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} />
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        className="form-input"
                        placeholder="Jean"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom" className="form-label">
                      Nom *
                    </label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} />
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        className="form-input"
                        placeholder="Dupont"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="telephone" className="form-label">
                    Téléphone *
                  </label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={20} />
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      className="form-input"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <Calendar size={20} />
                <h3 className="section-title">Informations de suivi</h3>
              </div>
              <div className="section-content">
                <div className="form-row">
                  
                  <div className="form-group">
                    <label htmlFor="dateDernierAppel" className="form-label">
                      Date du dernier appel
                    </label>
                    <input
                      type="date"
                      id="dateDernierAppel"
                      name="dateDernierAppel"
                      className="form-input"
                      value={formData.dateDernierAppel}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateProchainRDV" className="form-label">
                      Date du prochain rendez-vous
                    </label>
                    <input
                      type="date"
                      id="dateProchainRDV"
                      name="dateProchainRDV"
                      className="form-input"
                      value={formData.dateProchainRDV}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nbAppels" className="form-label">
                      Nombre d'appels
                    </label>
                    <input
                      type="number"
                      id="nbAppels"
                      name="nbAppels"
                      className="form-input"
                      min="0"
                      value={formData.nbAppels}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="etat" className="form-label">
                      État *
                    </label>
                    <select
                      id="etat"
                      name="etat"
                      className="form-input"
                      value={formData.etat}
                      onChange={handleChange}
                      required
                    >
                      {etats.map(etat => (
                        <option key={etat} value={etat}>{etat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="NF" className="form-label">
                      NF (Note /5)
                    </label>
                    <select
                      id="NF"
                      name="NF"
                      className="form-input"
                      value={formData.NF}
                      onChange={handleChange}
                    >
                      {[0, 1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
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

export default LeadUpdate;

