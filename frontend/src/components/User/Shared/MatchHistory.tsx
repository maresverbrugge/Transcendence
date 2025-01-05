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
                    className="btn btn-link p-0"
                    style={{ textDecoration: 'none' }}
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