import React from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './hooks/AuthenticationCheck.tsx';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading screen while checking authentication
  }
  else if (!isAuthenticated) {
    return <Navigate to="/" />; // Redirect to login page if not authenticated
  }
  else {
    return element; // Render the component if authenticated
  }
};

export default ProtectedRoute;