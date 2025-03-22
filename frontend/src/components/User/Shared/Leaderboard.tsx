import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { emitter } from '../../emitter';

import { LeaderboardData } from '../interfaces';

const Leaderboard = ({ triggerRefresh }: { triggerRefresh?: boolean }) => {
  const navigate = useNavigate();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/leaderboard/${token}`);
        // console.log('Leaderboard data fetched:', response.data); // for testing, romove later
        setLeaderboardData(response.data);
      } catch (error) {
        emitter.emit("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [triggerRefresh]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <p className="fs-4 mb-2">Loading leaderboard...</p>
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="text-center mt-5">
        <p className="fs-4 text-muted">No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
    <h2 className="text-center mb-3">Leaderboard</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">User</th>
              <th scope="col" className="text-end">Player Rating</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry: LeaderboardData) => (
              <tr key={entry.rank}>
                <td className="fw-bold">{entry.rank}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={entry.avatarURL}
                      alt={`${entry.username}'s avatar`}
                      className="rounded-circle"
                      style={{ width: '3vw', height: '3vw', objectFit: 'cover' }}
                    />
                    <button
                    onClick={() => navigate(`/profile/${entry.ID}`)}
                    className="btn btn-link p-0 text-decoration-none ms-3"
                    style={{
                      fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                      color: 'white', // Default primary color
                      textDecoration: 'none', // Remove underline
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--bs-primary)' // Change color on hover
                      e.currentTarget.style.textDecoration = 'underline'; // Optional underline
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white'; // Revert to primary color
                      e.currentTarget.style.textDecoration = 'none'; // Remove underline
                    }}
                  >
                    {entry.username}
                  </button>
                  </div>
                </td>
                <td className="text-end">{entry.ladderRank} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
