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
        localStorage.setItem('tempToken', token.access_token);
        axios.post('http://localhost:3001/two-factor/is-enabled', { intraName: user })
        .then(response => {
          const twoFactorAuthenticationEnabled = response.data.isEnabled;
          const userID = response.data.userID;
          // if user has 2fa enabled, redirect to 2fa page
          if (twoFactorAuthenticationEnabled) {
            navigate('/login/verify-2fa', { state: { userID: userID } });
          }
        })
        .catch(error => {})
        localStorage.removeItem('tempToken');
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