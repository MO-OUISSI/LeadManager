import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, getProfile, registerAdmin as registerAdminApi, checkAdminExists as checkAdminExistsApi } from '../api/userApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(null);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null;
    }

    try {
      const userData = await getProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh profile', error);
      return null;
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await getProfile();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { token: newToken } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);

      const userData = await getProfile();
      setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const registerAdmin = async (userData) => {
    try {
      await registerAdminApi(userData);
      setAdminExists(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const checkAdminExists = useCallback(async () => {
    if (adminExists !== null) {
      return adminExists;
    }
    
    try {
      const exists = await checkAdminExistsApi();
      setAdminExists(exists);
      return exists;
    } catch (error) {
      console.error('Error checking admin exists:', error);
      setAdminExists(true);
      return true;
    }
  }, [adminExists]);

  const value = {
    user,
    token,
    loading,
    adminExists,
    refreshProfile,
    login,
    registerAdmin,
    logout,
    checkAdminExists,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

