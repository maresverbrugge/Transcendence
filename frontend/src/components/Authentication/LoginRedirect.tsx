import React, { useEffect, useState } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';
import { getToken, isTwoFactorEnabled, markUserOnline } from './apiCalls.tsx';

const LoginRedirect = () => {
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  useEffect(() => {
    const original_state = process.env.REACT_APP_LOGIN_STATE;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state || state !== original_state) {
      console.error('Invalid code or state');
      setAccessDenied(true);
      return;
    }

    const handleLoginRedirect = async () => {
      try {
        const tokenResponse = await getToken(code, state);
        const user = tokenResponse.data.user;
        const token = tokenResponse.data.token;
        
        try {
          const isEnabledResponse = await isTwoFactorEnabled(user);
          if (isEnabledResponse.data.isEnabled) {
            localStorage.setItem('tempToken', token.access_token);
            navigate('/login/verify-2fa', { state: { userID: isEnabledResponse.data.userID } });
            return;
          }
        } catch { }

        localStorage.setItem('authenticationToken', token.access_token);
        await markUserOnline(token.access_token);
        navigate('/main');
      } catch (error) {
        console.error('Error during login redirect:', error);
        setErrorOccurred(true);
      }
    };

    handleLoginRedirect();
  }, [navigate]);

  if (accessDenied) {
    return <SingleHeader text="Access Denied" />;
  } else if (errorOccurred) {
    return <SingleHeader text="Error Occurred" />;
  } else {
    return <SingleHeader text="Logging In..." />;
  }
};

export default LoginRedirect;
