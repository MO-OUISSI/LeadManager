import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, MessageSquare, Phone, Calendar, ChevronDown, Check, X, Upload, FileSpreadsheet } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Leads.css';
import { listLeads, deleteLead, updateLead, createLead } from '../api/leadsApi';
import { useDarkMode } from '../contexts/DarkModeContext';
import Loading from '../components/Loading';
import Notes from '../components/Notes';
import * as XLSX from 'xlsx';

const Leads = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterNF, setFilterNF] = useState('all');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [editingField, setEditingField] = useState(null); 
  const [editValues, setEditValues] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [showExcelGuide, setShowExcelGuide] = useState(false);
  const fileInputRef = useRef(null);

  const etats = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];

  const getEtatColor = (etat) => {
    const palette = {
      light: {
        'Nouveau': { bg: '#E0F2FE', text: '#0369A1' },
        'En cours': { bg: '#FEF3C7', text: '#B45309' },
        'Qualifié': { bg: '#DCFCE7', text: '#15803D' },
        'Non qualifié': { bg: '#FEE2E2', text: '#B91C1C' },
        'Gagné': { bg: '#E0E7FF', text: '#4338CA' },
        'Perdu': { bg: '#E5E7EB', text: '#374151' },
        default: { bg: '#E5E7EB', text: '#374151' },
      },
      dark: {
        'Nouveau': { bg: '#082F49', text: '#7DD3FC' },
        'En cours': { bg: '#422006', text: '#FACC15' },
        'Qualifié': { bg: '#052E16', text: '#4ADE80' },
        'Non qualifié': { bg: '#450A0A', text: '#FCA5A5' },
        'Gagné': { bg: '#1E1B4B', text: '#A5B4FC' },
        'Perdu': { bg: '#1F2937', text: '#D1D5DB' },
        default: { bg: '#1F2937', text: '#D1D5DB' }
      }
    };
    const scheme = isDarkMode ? 'dark' : 'light';
    return palette[scheme][etat] || palette[scheme].default;
  };

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listLeads();
        
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];

        setLeads(sorted);
      } catch (err) {
        setError(err.message || 'Impossible de récupérer les leads.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    if (importStatus) {
      const timer = setTimeout(() => {
        setImportStatus(null);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telephone?.includes(searchTerm);
      const matchesFilter = filterState === 'all' || lead.etat === filterState;
      const matchesNF = filterNF === 'all' || (lead.NF ?? 0) === parseInt(filterNF);
      return matchesSearch && matchesFilter && matchesNF;
    });
  }, [leads, searchTerm, filterState, filterNF]);

  const handleShowNotes = (leadId) => {
    setSelectedLeadId(leadId);
    setShowNotes(true);
  };
  const handleEdit = (leadId) => navigate(`/user/leads/${leadId}/edit`);

  const handleDelete = async (leadId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return;
    try {
      setDeletingId(leadId);
      await deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead._id !== leadId));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer ce lead.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = () => navigate('/user/leads/create');

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const normalizeColumnName = (name) => {
    if (!name) return '';
    return name.toString().toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/ç/g, 'c');
  };

  const findColumnIndex = (headers, possibleNames) => {
    for (let i = 0; i < headers.length; i++) {
      const normalized = normalizeColumnName(headers[i]);
      for (const name of possibleNames) {
        if (normalized.includes(name)) {
          return i;
        }
      }
    }
    return -1;
  };

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue.toISOString().split('T')[0];
    if (typeof dateValue === 'number') {
      
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString().split('T')[0];
    }
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
    return null;
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setImportStatus({ type: 'error', message: 'Veuillez sélectionner un fichier Excel (.xlsx ou .xls)' });
      return;
    }

    setImporting(true);
    setImportStatus(null);

    try {
      const jsonData = await parseExcelFile(file);
      
      if (jsonData.length < 2) {
        throw new Error('Le fichier Excel doit contenir au moins un en-tête et une ligne de données');
      }

      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);

      
      const nomIndex = findColumnIndex(headers, ['nom complet', 'nom', 'name']);
      const prenomIndex = findColumnIndex(headers, ['prenom', 'prénom', 'firstname']);
      const telephoneIndex = findColumnIndex(headers, ['telephone', 'téléphone', 'phone', 'tel']);
      const appelsIndex = findColumnIndex(headers, ['appels', 'nbappels', 'nb appels', 'calls']);
      const dernierAppelIndex = findColumnIndex(headers, [
  'datedernierappel',
  'dernier appel',
  'date dernier appel'
]);
      const prochainRDVIndex = findColumnIndex(headers, ['prochain rdv', 'prochain rendez-vous', 'next meeting', 'rdv']);
      const nfIndex = findColumnIndex(headers, ['nf', 'note', 'rating']);
      const etatIndex = findColumnIndex(headers, ['etat', 'état', 'status', 'state']);

      const etats = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.every(cell => !cell)) continue; 

        try {
          
          let nom = '';
          let prenom = '';
          
          if (nomIndex >= 0 && row[nomIndex]) {
            const nomComplet = String(row[nomIndex]).trim();
            const parts = nomComplet.split(/\s+/);
            if (parts.length >= 2) {
              prenom = parts[0];
              nom = parts.slice(1).join(' ');
            } else {
              nom = nomComplet;
            }
          }
          
          if (prenomIndex >= 0 && row[prenomIndex]) {
            prenom = String(row[prenomIndex]).trim();
          }
          if (nomIndex >= 0 && nomIndex === prenomIndex && !prenom) {
            
            const nomComplet = String(row[nomIndex]).trim();
            const parts = nomComplet.split(/\s+/);
            if (parts.length >= 2) {
              prenom = parts[0];
              nom = parts.slice(1).join(' ');
            }
          }

          if (!nom && !prenom) {
            errorCount++;
            errors.push(`Ligne ${i + 2}: Nom ou prénom requis`);
            continue;
          }

          const telephone = telephoneIndex >= 0 && row[telephoneIndex] 
            ? String(row[telephoneIndex]).trim() 
            : '';

          if (!telephone) {
            errorCount++;
            errors.push(`Ligne ${i + 2}: Téléphone requis`);
            continue;
          }

          const nbAppels = appelsIndex >= 0 && row[appelsIndex]
            ? parseInt(row[appelsIndex]) || 0
            : 0;

          const dateDernierAppel = dernierAppelIndex >= 0 && row[dernierAppelIndex]
            ? parseDate(row[dernierAppelIndex])
            : null;

          const dateProchainRDV = prochainRDVIndex >= 0 && row[prochainRDVIndex]
            ? parseDate(row[prochainRDVIndex])
            : null;

          const NF = nfIndex >= 0 && row[nfIndex] !== undefined && row[nfIndex] !== null && row[nfIndex] !== ''
            ? Math.max(0, Math.min(5, parseInt(row[nfIndex]) || 0))
            : 0;

          let etat = 'Nouveau';
          if (etatIndex >= 0 && row[etatIndex]) {
            const etatValue = String(row[etatIndex]).trim();
            if (etats.includes(etatValue)) {
              etat = etatValue;
            }
          }

          const leadData = {
            nom: nom || '',
            prenom: prenom || '',
            telephone,
            nbAppels,
            dateDernierAppel,
            dateProchainRDV,
            NF,
            etat,
          };

          await createLead(leadData);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Ligne ${i + 2}: ${error.message || 'Erreur inconnue'}`);
        }
      }

      
      const updatedLeads = await listLeads();
      const sorted = Array.isArray(updatedLeads)
        ? [...updatedLeads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setLeads(sorted);

      setImportStatus({
        type: successCount > 0 ? 'success' : 'error',
        message: `${successCount} lead(s) importé(s) avec succès${errorCount > 0 ? `. ${errorCount} erreur(s).` : '.'}`,
        errors: errorCount > 0 ? errors : null
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error.message || 'Erreur lors de l\'importation du fichier Excel'
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    setShowExcelGuide(true);
  };

  const handleProceedImport = () => {
    setShowExcelGuide(false);
    fileInputRef.current?.click();
  };

  const handleEtatChange = async (leadId, newEtat) => {
    try {
      const updatedLead = await updateLead(leadId, { etat: newEtat });
      setLeads(prev =>
        prev.map(l => (l._id === leadId ? { ...l, etat: updatedLead.etat } : l))
      );
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour l\'état');
    }
  };

  const handleNFChange = async (leadId, newNF) => {
    try {
      const updatedLead = await updateLead(leadId, { NF: parseInt(newNF) });
      setLeads(prev =>
        prev.map(l => (l._id === leadId ? { ...l, NF: updatedLead.NF } : l))
      );
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour la note NF');
    }
  };

  const startEditing = (leadId, field, currentValue) => {
    if (field === 'nomComplet') {
      const lead = leads.find(l => l._id === leadId);
      setEditValues({
        prenom: lead?.prenom || '',
        nom: lead?.nom || ''
      });
    } else {
      setEditValues({ [field]: currentValue });
    }
    setEditingField({ leadId, field });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };

  const saveEdit = async (leadId, field) => {
    try {
      setUpdatingId(leadId);
      let updateData = {};

      if (field === 'nomComplet') {
        updateData = {
          prenom: editValues.prenom?.trim() || '',
          nom: editValues.nom?.trim() || ''
        };
      } else if (field === 'telephone') {
        updateData = { telephone: editValues.telephone?.trim() || '' };
      } else if (field === 'nbAppels') {
        updateData = { nbAppels: parseInt(editValues.nbAppels) || 0 };
      }

      const updatedLead = await updateLead(leadId, updateData);
      setLeads(prev =>
        prev.map(l => (l._id === leadId ? { ...l, ...updatedLead } : l))
      );
      cancelEditing();
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="leads-page">
        <div className="leads-header">
          <div>
            <h2 className="page-title">Gestion des Leads</h2>
            <p className="page-subtitle">Créez, modifiez et suivez vos clients potentiels</p>
          </div>
          <div className="leads-header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
            />
            <button 
              onClick={handleImportClick} 
              className="btn btn-secondary"
              disabled={importing}
              title="Importer depuis Excel"
            >
              {importing ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Importation...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Importer Excel</span>
                </>
              )}
            </button>
            <button onClick={handleCreate} className="btn btn-primary">
              <Plus size={18} />
              <span>Nouveau Lead</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className={`import-status ${importStatus.type}`}>
            <div className="import-status-header">
              <div className="import-status-message">
                {importStatus.type === 'success' ? '✓' : '✗'} {importStatus.message}
              </div>
              <button 
                onClick={() => setImportStatus(null)} 
                className="import-status-close"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            {importStatus.errors && importStatus.errors.length > 0 && (
              <details className="import-errors">
                <summary>Voir les erreurs ({importStatus.errors.length})</summary>
                <ul>
                  {importStatus.errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {importStatus.errors.length > 10 && (
                    <li>... et {importStatus.errors.length - 10} autre(s) erreur(s)</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="leads-filters">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-box-NF">
            <select
              value={filterNF}
              onChange={(e) => setFilterNF(e.target.value)}
              className="filter-select-NF"
            >
              <option value="all">Toutes NF</option>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="filter-box">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les états</option>
              {etats.map(etat => <option key={etat} value={etat}>{etat}</option>)}
            </select>
          </div>
        </div>

        <div className="leads-table-container">
          {error && <div className="leads-error">{error}</div>}
          {loading ? (
            <Loading />
          ) : (
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Téléphone</th>
                  <th>Appels</th>
                  <th>Dernier appel</th>
                  <th>Prochain RDV</th>
                  <th>NF</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.slice(0, visibleCount).map(lead => {
                  const isEditingName = editingField?.leadId === lead._id && editingField?.field === 'nomComplet';
                  const isEditingPhone = editingField?.leadId === lead._id && editingField?.field === 'telephone';
                  const isEditingAppels = editingField?.leadId === lead._id && editingField?.field === 'nbAppels';
                  const isUpdating = updatingId === lead._id;

                  return (
                    <tr key={lead._id}>
                      <td className="lead-name-cell">
                        {isEditingName ? (
                          <div className="inline-edit-container">
                            <div className="inline-edit-inputs">
                              <input
                                type="text"
                                value={editValues.prenom || ''}
                                onChange={(e) => setEditValues({ ...editValues, prenom: e.target.value })}
                                placeholder="Prénom"
                                className="inline-edit-input"
                                autoFocus
                              />
                              <input
                                type="text"
                                value={editValues.nom || ''}
                                onChange={(e) => setEditValues({ ...editValues, nom: e.target.value })}
                                placeholder="Nom"
                                className="inline-edit-input"
                              />
                            </div>
                            <div className="inline-edit-actions">
                              <button
                                onClick={() => saveEdit(lead._id, 'nomComplet')}
                                className="inline-edit-btn save-btn"
                                disabled={isUpdating}
                                title="Enregistrer"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="inline-edit-btn cancel-btn"
                                disabled={isUpdating}
                                title="Annuler"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="editable-cell">
                            <strong>{lead.prenom} {lead.nom}</strong>
                            <button
                              onClick={() => startEditing(lead._id, 'nomComplet')}
                              className="inline-edit-trigger"
                              title="Modifier"
                              disabled={isUpdating}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="lead-phone-cell">
                        {isEditingPhone ? (
                          <div className="inline-edit-container">
                            <input
                              type="text"
                              value={editValues.telephone || ''}
                              onChange={(e) => setEditValues({ telephone: e.target.value })}
                              placeholder="Téléphone"
                              className="inline-edit-input"
                              autoFocus
                            />
                            <div className="inline-edit-actions">
                              <button
                                onClick={() => saveEdit(lead._id, 'telephone')}
                                className="inline-edit-btn save-btn"
                                disabled={isUpdating}
                                title="Enregistrer"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="inline-edit-btn cancel-btn"
                                disabled={isUpdating}
                                title="Annuler"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="editable-cell">
                            <span>{lead.telephone || '-'}</span>
                            <button
                              onClick={() => startEditing(lead._id, 'telephone', lead.telephone)}
                              className="inline-edit-trigger"
                              title="Modifier"
                              disabled={isUpdating}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditingAppels ? (
                          <div className="inline-edit-container">
                            <input
                              type="number"
                              value={editValues.nbAppels ?? 0}
                              onChange={(e) => setEditValues({ nbAppels: e.target.value })}
                              placeholder="0"
                              className="inline-edit-input"
                              min="0"
                              autoFocus
                            />
                            <div className="inline-edit-actions">
                              <button
                                onClick={() => saveEdit(lead._id, 'nbAppels')}
                                className="inline-edit-btn save-btn"
                                disabled={isUpdating}
                                title="Enregistrer"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="inline-edit-btn cancel-btn"
                                disabled={isUpdating}
                                title="Annuler"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="editable-cell">
                            <span>{lead.nbAppels ?? 0}</span>
                            <button
                              onClick={() => startEditing(lead._id, 'nbAppels', lead.nbAppels ?? 0)}
                              className="inline-edit-trigger"
                              title="Modifier"
                              disabled={isUpdating}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>{lead.dateDernierAppel ? new Date(lead.dateDernierAppel).toLocaleDateString('fr-FR') : '-'}</td>
                      <td>{lead.dateProchainRDV ? new Date(lead.dateProchainRDV).toLocaleDateString('fr-FR') : '-'}</td>
                      <td>
                        <div className="nf-select-wrapper">
                          <select
                            value={lead.NF ?? 0}
                            onChange={(e) => handleNFChange(lead._id, e.target.value)}
                            className="nf-select-simple"
                          >
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                          <span className="nf-display-text">{lead.NF ?? 0}/5</span>
                        </div>
                      </td>
                      <td>
                        <select
                          value={lead.etat}
                          onChange={(e) => handleEtatChange(lead._id, e.target.value)}
                          style={{
                            backgroundColor: getEtatColor(lead.etat).bg,
                            color: getEtatColor(lead.etat).text,
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {etats.map(option => {
                            const { bg, text } = getEtatColor(option);
                            return <option key={option} value={option} style={{ backgroundColor: bg, color: text }}>{option}</option>;
                          })}
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleShowNotes(lead._id)} className="action-btn show-btn" title="Notes"><MessageSquare size={16} /></button>
                          <button onClick={() => handleEdit(lead._id)} className="action-btn edit-btn" title="Modifier"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(lead._id)} className="action-btn delete-btn" title="Supprimer" disabled={deletingId === lead._id}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredLeads.length > visibleCount && (
          <div className="load-more-container">
            <button className="btn-load-more" onClick={() => setVisibleCount(prev => prev + 8)}>
              <span>Charger plus</span> <ChevronDown size={18} className="load-more-icon" />
            </button>
          </div>
        )}

        {!loading && filteredLeads.length === 0 && (
          <div className="empty-state"><p>Aucun lead trouvé</p></div>
        )}
      </div>
      {showNotes && selectedLeadId && (
        <Notes
          leadId={selectedLeadId}
          onClose={() => {
            setShowNotes(false);
            setSelectedLeadId(null);
          }}
        />
      )}
      {showExcelGuide && (
        <div className="excel-guide-overlay" onClick={(e) => e.target.classList.contains('excel-guide-overlay') && setShowExcelGuide(false)}>
          <div className="excel-guide-container">
            <div className="excel-guide-header">
              <div className="excel-guide-header-content">
                <FileSpreadsheet size={24} className="excel-guide-icon" />
                <div>
                  <h3 className="excel-guide-title">Format du fichier Excel</h3>
                  <p className="excel-guide-subtitle">Structure requise pour l'importation</p>
                </div>
              </div>
              <button className="excel-guide-close-btn" onClick={() => setShowExcelGuide(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="excel-guide-content">
              <p className="excel-guide-description">
                Votre fichier Excel doit contenir les colonnes suivantes dans l'ordre indiqué :
              </p>
              <div className="excel-guide-table-wrapper">
                <table className="excel-guide-table">
                  <thead>
                    <tr>
                      <th>nom</th>
                      <th>prenom</th>
                      <th>telephone</th>
                      <th>nbAppels</th>
                      <th>dateDernierAppel</th>
                      <th>dateProchainRDV</th>
                      <th>NF</th>
                      <th>etat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ahmed</td>
                      <td>Salah</td>
                      <td>0612345678</td>
                      <td>2</td>
                      <td>2025-01-15</td>
                      <td>2025-02-01</td>
                      <td>3</td>
                      <td>Nouveau</td>
                    </tr>
                    <tr>
                      <td>Meryem</td>
                      <td>Zahid</td>
                      <td>0654321987</td>
                      <td>5</td>
                      <td>2025-01-10</td>
                      <td>2025-01-28</td>
                      <td>4</td>
                      <td>En cours</td>
                    </tr>
                    <tr>
                      <td>Hicham</td>
                      <td>Benz</td>
                      <td>0678912345</td>
                      <td>1</td>
                      <td>2025-01-12</td>
                      <td>2025-01-30</td>
                      <td>5</td>
                      <td>Qualifié</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
            </div>
            <div className="excel-guide-actions">
              <button className="btn-excel-cancel" onClick={() => setShowExcelGuide(false)}>
                Annuler
              </button>
              <button className="btn-excel-proceed" onClick={handleProceedImport}>
                <Upload size={18} />
                Continuer l'importation
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Leads;
