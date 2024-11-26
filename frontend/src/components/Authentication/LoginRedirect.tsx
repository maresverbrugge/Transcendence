import React, { useEffect, useState } from 'react';
import axios from 'axios';

// More info on this section here: https://api.intra.42.fr/apidoc/guides/web_application_flow

const LoginRedirect = () => {
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const original_state = process.env.REACT_APP_LOGIN_STATE;
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
      // Send the code and state to the backend to get the access token
      axios.post('http://localhost:3001/login/get-token', {
        code: code,
        state: state,
      })
      .then(response => {
        const data = response.data;
        console.log('data.access_token:', data.access_token)
        localStorage.setItem('authenticationToken', data.access_token);
        window.location.href = '/main';
      })
      .catch(err => {
        const error_message = err.response ? err.response.data : err.message;
        console.error('Error while logging in:', error_message);
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