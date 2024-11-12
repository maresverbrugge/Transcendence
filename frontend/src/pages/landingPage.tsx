import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to the Main Page</h1>
            <button onClick={() => navigate('/game')}>Go to Game</button>
            <button onClick={() => navigate('/chat')}>Go to Chat</button>
            <button onClick={() => navigate('/account/:id')}>User Account</button>
        </div>
    );
};

export default MainPage;
