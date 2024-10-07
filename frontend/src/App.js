// The App.js file is the main entry point for the frontend. It contains the routing logic for the application.

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login';
import GameApp from './pages/game';
import Home from './pages/home';
import LoginRedirect from './components/LoginRedirect';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/game" element={<GameApp />} />
          <Route path="/login/callback" element={<LoginRedirect />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;