// This component is used to handle the login redirect from the server.
// When the user logs in, the server will redirect the user to /oauth/callback with a code and a state.
// This is still a work in progress!

import React, { useEffect } from 'react';

const OAuthRedirect = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      fetch('/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('token', data.access_token);
          window.location.href = '/';
        });
    }
  }, []);

  return <div>Redirecting...</div>;
};

export default OAuthRedirect;