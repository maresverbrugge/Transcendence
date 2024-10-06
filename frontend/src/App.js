import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login';
import GameApp from './pages/game';
import Home from './pages/home';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/game" element={<GameApp />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;