import React from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './Hooks/AuthenticationCheck';
import SingleHeader from './Pages/SingleHeader';

const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    return <SingleHeader text="Loading..." />;
  } else if (!isAuthenticated) {
    return <Navigate to="/logout" />;
  } else {
    return element;
  }
};

export default ProtectedRoute;
