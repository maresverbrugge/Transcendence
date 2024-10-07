// Login page that is shown when the user goes to localhost:3000/login
// API credentials can be found on https://profile.intra.42.fr/oauth/applications/68291

import React, { useEffect } from 'react';

// The client ID you received from 42 when you registered.
const clientId = 'u-s4t2ud-44ff70cec9bab3625920e531e276724bfc868e5ec663c53d1a73a93d465e03ce';
// The URL in your app where users will be sent after authorization. 
const redirectUri = 'http://localhost:3000/game';
// An unguessable random string. It is used to protect against cross-site request forgery attacks.
const state = 'a_very_long_random_string_witchmust_be_unguessable';

const handleLogin = () => {
  window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public&state=${state}`;
};

const LoginPage = () => {
  return (
    <div>
      <button onClick={handleLogin}>Login with 42</button>
    </div>
  );
}

export default LoginPage;