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

export const getNotesByLead = (leadId) => {
  return apiRequest(`/notes/lead/${leadId}`, { method: 'GET' });
};

export const createNote = (noteData) => {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};

export const updateNote = (noteId, noteData) => {
  return apiRequest(`/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
};

export const deleteNote = (noteId) => {
  return apiRequest(`/notes/${noteId}`, { method: 'DELETE' });
};

