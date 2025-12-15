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

export const listNotifications = () => {
  return apiRequest('/notifications', { method: 'GET' });
};

export const markNotificationRead = (id) => {
  return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
};

export const markAllNotificationsRead = () => {
  return apiRequest(`/notifications/read-all`, { method: 'PUT' });
};

export const deleteNotification = (id) => {
  return apiRequest(`/notifications/${id}`, { method: 'DELETE' });
};

export const deleteAllNotifications = () => {
  return apiRequest(`/notifications/all`, { method: 'DELETE' });
};
