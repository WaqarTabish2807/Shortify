import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (user) {
    // If user is authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute; 