import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Edit, Trash2, Eye, Mail } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import '../css/Agents.css';
import { listAgents, deleteAgent } from '../api/agentApi';
import { getProfile } from '../api/userApi'; 

import Loading from '../components/Loading';

const Agents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [agents, setAgents] = useState([]);
  const [admin, setAdmin] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchAgentsAndAdmin = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminData = await getProfile();
        setAdmin(adminData);

        const agentsData = await listAgents();
        setAgents(Array.isArray(agentsData) ? agentsData : []);
      } catch (err) {
        setError(err.message || 'Impossible de récupérer les agents.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentsAndAdmin();
  }, []);

  const roles = ['admin', 'agent'];

  const getRoleColor = (role) => {
    return role === 'admin' ? '#d97706' : '#216d69';
  };

  const filteredAgents = useMemo(() => {
    // combine admin + agents
    const allAgents = admin ? [admin, ...agents] : agents;

    return allAgents.filter(agent => {
      const matchesSearch =
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRole === 'all' || agent.role === filterRole;
      return matchesSearch && matchesFilter;
    });
  }, [agents, admin, searchTerm, filterRole]);

  const handleShow = (agentId) => {
    navigate(`/user/agents/${agentId}`);
  };

  const handleEdit = (agentId) => {
    navigate(`/user/agents/${agentId}/edit`);
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;

    try {
      setDeletingId(agentId);
      await deleteAgent(agentId);
      setAgents(prev => prev.filter(agent => agent._id !== agentId));
    } catch (err) {
      alert(err.message || 'Impossible de supprimer cet agent.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = () => {
    navigate('/user/agents/create');
  };

  return (
    <DashboardLayout>
      <div className="agents-page">
        <div className="agents-header">
          <div>
            <h2 className="page-title">Gestion des Agents</h2>
            <p className="page-subtitle">Suivez les performances de vos agents</p>
          </div>
          <button onClick={handleCreate} className="btn btn-primary">
            <UserPlus size={18} />
            <span>Nouvel Agent</span>
          </button>
        </div>

        <div className="agents-filters">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="agents-table-container">
          {error && <div className="agents-error">{error}</div>}
          {loading ? (
            <Loading />
          ) : (
            <table className="agents-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent, index) => (
                  <tr key={agent._id || index}>
                    <td><strong>{agent.name}</strong></td>
                    <td>
                      <span>{agent.email}</span>
                    </td>
                    <td>
                      <span
                        className="role-badge"
                        style={{
                          backgroundColor: `${getRoleColor(agent.role)}20`,
                          color: getRoleColor(agent.role)
                        }}
                      >
                        {agent.role === 'admin' ? 'Admin' : 'Agent'}
                      </span>
                    </td>
                    <td>{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                      {agent.role !== 'admin' && (
                        <div className="action-buttons">
                          <button onClick={() => handleShow(agent._id)} className="action-btn show-btn" title="Voir"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(agent._id)} className="action-btn edit-btn" title="Modifier"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(agent._id)} className="action-btn delete-btn" title="Supprimer" disabled={deletingId === agent._id}><Trash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredAgents.length === 0 && (
          <div className="empty-state"><p>Aucun agent trouvé</p></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Agents;
