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
        <button className="btn btn-primary" onClick={() => navigate('/game')}>
          Go to Game
        </button>
        <button className="btn btn-info" onClick={() => navigate('/chat')}>
          Go to Chat
        </button>
        <button className="btn btn-success" onClick={() => navigate('/leaderboard')}>
          Go to Leaderboard
        </button>
        <button className="btn btn-warning" onClick={() => navigate('/profile')}>
          My Account
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/profile/2')}>
          TESTING: View Profile (UserID=2)
        </button>
      </div>
    </div>
  );
};

export default MainPage;

//! let op, User Profile: user ID is hier gehard-code!!!
