import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MatchHistoryData } from '../interfaces';

const MatchHistory = ({ matchHistoryData }: { matchHistoryData: MatchHistoryData[] }) => {
  const navigate = useNavigate();

  return(
  <div className="p-3">
    <h5 className="text-center mb-3">Match History</h5>
    {matchHistoryData.length === 0 ? (
      <p className="text-center text-muted">No matches played yet</p>
    ) : (
      <table className="table table-sm table-striped align-middle">
        <thead>
          <tr>
            <th>Result</th>
            <th>Score</th>
            <th>Opponent</th>
          </tr>
        </thead>
        <tbody>
          {matchHistoryData.map((match, index) => (
            <tr key={index}>
              <td
                className={
                  match.result === 'Win' ? 'text-success' : 'text-danger'}>
                {match.result}
              </td>
              <td>
                {match.scorePlayer1} - {match.scorePlayer2}
              </td>
              <td>
                  <button
                    onClick={() => navigate(`/profile/${match.opponentID}`)}
                    className="btn btn-link p-0 text-decoration-none"
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
                    {match.opponent}
                  </button>

                </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  );
};

export default MatchHistory;