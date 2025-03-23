import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SingleHeader from './Pages/SingleHeader';
import { getToken, isTwoFactorEnabled, markUserOnline } from '../Utils/apiCalls';
import { emitter } from '../emitter';

const LoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const original_state = process.env.REACT_APP_LOGIN_STATE;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state || state !== original_state) {
      emitter.emit('error', new Error('Access Denied - Invalid state or code.'));
      navigate('/logout');
      return;
    }

    const handleLoginRedirect = async () => {
      try {
        const tokenResponse = await getToken(code, state);
        const token = tokenResponse.data;

        try {
          const isEnabledResponse = await isTwoFactorEnabled(token.access_token);
          if (isEnabledResponse.data) {
            localStorage.setItem('tempToken', token.access_token);
            navigate('/login/verify-2fa');
            return;
          }
        } catch {}

        localStorage.setItem('authenticationToken', token.access_token);
        await markUserOnline(token.access_token);
        navigate('/main');
      } catch (error) {
        emitter.emit('error', error);
        navigate('/logout');
        return;
      }
    };

    handleLoginRedirect();
  }, [navigate]);
  
  return <SingleHeader text="Logging In..." />;
};

export default LoginRedirect;
