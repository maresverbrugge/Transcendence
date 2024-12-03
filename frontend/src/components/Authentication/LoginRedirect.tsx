import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';

// More info on this section here: https://api.intra.42.fr/apidoc/guides/web_application_flow

const LoginRedirect = () => {
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const original_state = process.env.REACT_APP_LOGIN_STATE;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      console.error('No code or state');
      setAccessDenied(true);
      return;
    }
    else if (state !== original_state) {
      console.error('Invalid state');
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
        const user = response.data.user;
        const token = response.data.token;
        // check if user has 2fa enabled
        // if user has 2fa enabled, redirect to 2fa page
        // if user does not have 2fa enabled, set token in local storage and redirect to main page
        localStorage.setItem('authenticationToken', token.access_token);
        axios.post('http://localhost:3001/login/online', { token: token.access_token })
        navigate('/main');
      })
      .catch(err => {
        const error_message = err.response ? err.response.data : err.message;
        console.error('Error while logging in:', error_message);
        setErrorOccurred(true);
      });
    }
  }, []);

  if (accessDenied) {
    return <SingleHeader text='Access Denied' />;
  } else if (errorOccurred) {
    return <SingleHeader text='Error Occurred' />;
  } else {
    return <SingleHeader text='Logging In...' />;
  }
};

export default LoginRedirect;