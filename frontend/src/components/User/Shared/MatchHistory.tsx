import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MatchHistoryData } from '../interfaces';

const MatchHistory = ({ matchHistoryData }: { matchHistoryData: MatchHistoryData[] }) => {
  const navigate = useNavigate();

  return (
    <div className="px-3 py-3">
      <h2 className="text-center mb-3">Match History</h2>
      {matchHistoryData.length === 0 ? (
        <p className="text-center text-muted">No matches played yet</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th scope="col">Result</th>
                <th scope="col">Score</th>
                <th scope="col">Opponent</th>
              </tr>
            </thead>
            <tbody>
              {matchHistoryData.map((match, index) => (
                <tr key={index}>
                  <td className={match.result === 'Win' ? 'text-success' : 'text-danger'}>
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
                        color: 'white',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--bs-primary)';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {match.opponent}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
