import React from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './Hooks/AuthenticationCheck';
import SingleHeader from './Pages/SingleHeader';

// API credentials can be found on https://profile.intra.42.fr/oauth/applications/68291
const client_id = process.env.REACT_APP_LOGIN_CLIENT_ID;
const redirect_uri = process.env.REACT_APP_LOGIN_REDIRECT;
const state = process.env.REACT_APP_LOGIN_STATE;

const handleLogin = () => {
  window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri || '')}&response_type=code&scope=public&state=${state}`;
};

const Login = () => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    <SingleHeader text="Loading..." />;
  } else if (isAuthenticated) {
    return <Navigate to="/main" />;
  }

  return (
    <div className="container vh-100">
      <div className="row h-100">
        <div className="col d-flex justify-content-center align-items-center">
          <button type="button" className="btn btn-primary w-30 fs-3 fw-bold" onClick={handleLogin}>
            Login with 42
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
