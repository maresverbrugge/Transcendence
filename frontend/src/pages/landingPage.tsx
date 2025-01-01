import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to the Main Page</h1>
            <button onClick={() => navigate('/game')}>Go to Game</button>
            <button onClick={() => navigate('/chat')}>Go to Chat</button>
            <button onClick={() => navigate('/leaderboard')}>Go to Leaderboard</button>
            <button onClick={() => navigate('/profile/2')}>User Profile</button>
            <button onClick={() => navigate('/account')}>User Account</button>
        </div>
    );
};

//! let op, User Profile: user ID is hier gehard-code!!!

export default MainPage;
