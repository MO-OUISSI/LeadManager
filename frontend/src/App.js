import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadInfo from './pages/LeadInfo';
import LeadCreate from './pages/LeadCreate';
import LeadUpdate from './pages/LeadUpdate';
import Agents from './pages/Agents';
import AgentInfo from './pages/AgentInfo';
import AgentCreate from './pages/AgentCreate';
import AgentUpdate from './pages/AgentUpdate';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminRoute from './contexts/AdminRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />


        <Route path="/user" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/user/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/user/leads/create" element={<ProtectedRoute><LeadCreate /></ProtectedRoute>} />
        <Route path="/user/leads/:id" element={<ProtectedRoute><LeadInfo /></ProtectedRoute>} />
        <Route path="/user/leads/:id/edit" element={<ProtectedRoute><LeadUpdate /></ProtectedRoute>} />

        <Route path="/user/agents" element={
          <AdminRoute>
            <Agents />
          </AdminRoute>
        } />

        <Route path="/user/agents/create" element={
          <AdminRoute>
            <AgentCreate />
          </AdminRoute>
        } />

        <Route path="/user/agents/:id" element={
          <AdminRoute>
            <AgentInfo />
          </AdminRoute>
        } />

        <Route path="/user/agents/:id/edit" element={
          <AdminRoute>
            <AgentUpdate />
          </AdminRoute>
        } />

        <Route path="/user/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/user/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
