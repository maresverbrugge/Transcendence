import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogOutButton from '../components/User/Account/LogOutButton';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">

      <div className="mb-4">
        <h1>Welcome!
        <p> <small className="text-body-secondary"> let's play PONG! 🏓</small> </p>
        </h1>
      </div>

      <div className="position-absolute top-0 end-0 m-3">
        <div style={{ maxWidth: '150px' }}>
          <LogOutButton buttonStyle="btn-outline-info" />
        </div>
      </div>



      <div className="d-grid gap-3 col-6 mx-auto">
        <button className="btn btn-primary" onClick={() => navigate('/queue')}>
          PLAY GAME
        </button>
        <button className="btn btn-info" onClick={() => navigate('/chat')}>
          CHAT
        </button>
        <button className="btn btn-success" onClick={() => navigate('/leaderboard')}>
          LEADERBOARD
        </button>
        <button className="btn btn-warning" onClick={() => navigate('/profile')}>
          ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default MainPage;
