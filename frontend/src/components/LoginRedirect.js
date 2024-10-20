// If the user grants the permission for your application to use the requested data, 
// it will be redirected to your redirect_uri with a temporary code in a GET code parameter
// as well as the state you provided in the previous step in a state parameter.
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Same state as in the frontend/src/pages/login.js file.
const original_state = 'unguessable_state_string_wow';

const LoginRedirect = () => {
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    // If the states don't match, the request has been created by a third party and the process should be aborted.
    if (state !== original_state) {
      console.error('Invalid state');
      return; // Return some error page?
    }

    if (code && state) {
      axios.post('http://localhost:3001/login/callback', {
        code: code,
        state: state,
      })
        .then(response => response.json())
        .then(data => {
          // Save the token in the local storage, so that the user doesn't have to log in again after refreshing the page?
          localStorage.setItem('token', data.access_token);
          // Redirect the user to the home page.
          window.location.href = '/game';
        });
    }
    else {
      console.error('No code or state');
      setAccessDenied(true);
    }
  }, []);

  if (accessDenied) {
    return <div>Access denied</div>;
  }
  else {
    return <div>Redirecting...</div>;
  }
};

export default LoginRedirect;