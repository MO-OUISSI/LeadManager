const API_BASE_URL = 'http://localhost:5000';

const getToken = () => {
  return localStorage.getItem('token');
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

export const registerAdmin = async (userData) => {
  return apiRequest('/auth/register-admin', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const login = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getProfile = async () => {
  return apiRequest('/auth/profile', {
    method: 'GET',
  });
};

export const updateProfile = async (userData) => {
  return apiRequest('/auth/profile/update', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const checkAdminExists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check admin status');
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking admin exists:', error);
    return true;
  }
};

