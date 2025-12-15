const API_BASE_URL = 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data;
};

export const listAgents = () => {
  return apiRequest('/auth', { method: 'GET' });
};

export const createAgent = (agentData) => {
  return apiRequest('/auth', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
};

export const getAgentById = (agentId) => {
  return apiRequest(`/auth/${agentId}`, { method: 'GET' });
};

export const updateAgent = (agentId, agentData) => {
  return apiRequest(`/auth/${agentId}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
  });
};

export const deleteAgent = (agentId) => {
  return apiRequest(`/auth/${agentId}`, { method: 'DELETE' });
};


