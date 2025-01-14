import React from 'react';
import GoBackButton from '../components/GoBackButton';
import Leaderboard from '../components/User/Shared/Leaderboard';

const LeaderboardPage = () => {
  return (
    <div className="container my-5">
        <GoBackButton />
        <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;

//! let op, User Profile: user ID is hier gehard-code!!!
