// API credentials can be found on https://profile.intra.42.fr/oauth/applications/68291

import React, { useEffect } from 'react';


const handleLogin = () => {
  // Get the API credentials from the environment variables
  const client_id = process.env.REACT_APP_LOGIN_CLIENT_ID;
  const redirect_uri = process.env.REACT_APP_LOGIN_REDIRECT;
  const state = process.env.REACT_APP_LOGIN_STATE;
  console.log("original client_id: ", client_id);
  window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=public&state=${state}`;
};

const LoginPage = () => {
  return (
    <div>
      <button onClick={handleLogin}>Login with 42</button>
    </div>
  );
}

export default LoginPage;