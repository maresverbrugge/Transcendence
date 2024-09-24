import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OAuthRedirect from './components/OAuthRedirect';

const clientId = 'u-s4t2ud-44ff70cec9bab3625920e531e276724bfc868e5ec663c53d1a73a93d465e03ce';
const redirectUri = 'http://localhost:3000/oauth/callback';
const state = 'a_very_long_random_string_witchmust_be_unguessable';

const App = () => {
  const handleLogin = () => {
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public&state=${state}`;
  };

  return (
    <Router>
      <div className="App">
        <button onClick={handleLogin}>Login with 42</button>
        <Routes>
          <Route path="/oauth/callback" element={<OAuthRedirect />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;