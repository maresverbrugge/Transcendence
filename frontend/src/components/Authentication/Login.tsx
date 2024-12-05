import React from 'react';
import { Navigate } from 'react-router-dom';
import isAuthenticatedHook from './something/AuthenticationCheck.tsx';
import SingleHeader from './Pages/SingleHeader.tsx';


// API credentials can be found on https://profile.intra.42.fr/oauth/applications/68291
const client_id = process.env.REACT_APP_LOGIN_CLIENT_ID;
const redirect_uri = process.env.REACT_APP_LOGIN_REDIRECT;
const state = process.env.REACT_APP_LOGIN_STATE;


const handleLogin = () => {
	window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=public&state=${state}`;
};


const Login = () => {
  const isAuthenticated = isAuthenticatedHook();

  if (isAuthenticated === null) {
    <SingleHeader text="Loading..." />;
  } else if (isAuthenticated) {
    return <Navigate to="/main" />;
  } 
  
  return (
    <div>
      <button onClick={handleLogin}>Login with 42</button>
    </div>
  )
};

export default Login;
