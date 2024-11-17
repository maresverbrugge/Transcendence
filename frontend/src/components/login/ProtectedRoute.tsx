import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, element }) => {
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" />;
  }
  return element;
};

export default ProtectedRoute;