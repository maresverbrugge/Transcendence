import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to the Main Page</h1>
            <button onClick={() => navigate('/game')}>Go to Game</button>
            <button onClick={() => navigate('/chat')}>Go to Chat</button>
            <button onClick={() => navigate('/user/1')}>User Account</button>
        </div>
    );
};

//! let op, User Account: user ID is hier gehard-code naar #1

export default MainPage;
