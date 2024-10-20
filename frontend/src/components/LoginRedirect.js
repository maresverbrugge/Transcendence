// If the user grants the permission for your application to use the requested data, 
// it will be redirected to your redirect_uri with a temporary code in a GET code parameter
// as well as the state you provided in the previous step in a state parameter.
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Same state as in the frontend/src/pages/login.js file.
const original_state = 'unguessable_state_string_wow';

const LoginRedirect = () => {
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (state !== original_state) {
      console.error('Invalid state');
      setAccessDenied(true);
      return;
    }
    else if (!code || !state) {
      console.error('No code or state');
      setAccessDenied(true);
      return;
    }
    else {
      axios.post('http://localhost:3001/login/callback', {
        code: code,
        state: state,
      })
      .then(data => {
        localStorage.setItem('token', data.access_token); // what is the purpose of this token?
        window.location.href = '/game';
      })
      .catch(err => {
        console.error('Error while logging in:', err);
        setErrorOccurred(true);
      });
    }
  }, []);

  if (accessDenied) {
    return <div>Access denied</div>;
  }
  else if (errorOccurred) {
    return <div>Error occurred</div>;
  }
  else {
    return <div>Redirecting...</div>;
  }
};

export default LoginRedirect;