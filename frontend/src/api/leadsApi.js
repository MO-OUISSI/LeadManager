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

export const listLeads = () => {
  return apiRequest('/lead', { method: 'GET' });
};

export const getLeadById = (leadId) => {
  return apiRequest(`/lead/${leadId}`, { method: 'GET' });
};

export const createLead = (leadData) => {
  return apiRequest('/lead', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });
};

export const updateLead = (leadId, leadData) => {
  return apiRequest(`/lead/${leadId}`, {
    method: 'PUT',
    body: JSON.stringify(leadData),
  });
};

export const deleteLead = (leadId) => {
  return apiRequest(`/lead/${leadId}`, { method: 'DELETE' });
};


