import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default AdminRoute;
