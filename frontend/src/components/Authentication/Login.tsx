import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './Hooks/AuthenticationCheck.tsx';
import LoginButton from './Pages/LoginButton.tsx';
import SingleHeader from './Pages/SingleHeader.tsx';

const Login = () => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    <SingleHeader text="Loading..." />;
  } else if (isAuthenticated == false) {
    return <LoginButton />;
  } else if (isAuthenticated) {
    return <Navigate to="/main" />;
  }
};

export default Login;
