import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LeaderboardData } from '../interfaces.tsx';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user/leaderboard');
        console.log('Leaderboard data fetched:', response.data);
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-3">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="text-center p-3">
        <p>No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h5 className="text-center mb-3">Leaderboard</h5>
      <table className="table table-sm table-striped align-middle">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th className="text-end">Player Rating</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((entry: LeaderboardData) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={entry.avatarURL}
                    alt={`${entry.username}'s avatar`}
                    className="rounded-circle me-2"
                    style={{ width: '40px', height: '40px' }}
                  />
                  <span>{entry.username}</span>
                </div>
              </td>
              <td className="text-end">{entry.ladderRank} XP</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
