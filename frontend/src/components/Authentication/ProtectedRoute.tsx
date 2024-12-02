import React from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './Hooks/AuthenticationCheck.tsx';
import SingleHeader from './Pages/SingleHeader.tsx';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    return <SingleHeader text="Loading..." />;
  } else if (!isAuthenticated) {
    return <Navigate to="/" />;
  } else {
    return element;
  }
};

export default ProtectedRoute;