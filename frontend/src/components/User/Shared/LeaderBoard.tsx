import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarURL: string;
  ladderRank: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user/leaderboard');
        setLeaderboard(response.data);
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

  if (leaderboard.length === 0) {
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
            <th>#</th>
            <th>Avatar</th>
            <th>Username</th>
            <th>Player Rating</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>
              <td>
                <img
                  src={entry.avatarURL}
                  alt={`${entry.username}'s avatar`}
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px' }}
                />
              </td>
              <td>{entry.username}</td>
              <td>{entry.ladderRank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
