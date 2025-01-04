import React from 'react';

import { MatchHistoryData } from '../interfaces';

const MatchHistory = ({ matchHistoryData }: { matchHistoryData: MatchHistoryData[] }) => (
  <div className="p-3">
    <h5 className="text-center mb-3">Match History</h5>
    {matchHistoryData.length === 0 ? (
      <p className="text-center text-muted">No matches played yet</p>
    ) : (
      <table className="table table-sm table-striped align-middle">
        <thead>
          <tr>
            <th>Opponent</th>
            <th>Score</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {matchHistoryData.map((match, index) => {
            const isWin = match.scorePlayer1 > match.scorePlayer2;
            return (
              <tr key={index}>
                <td>{match.opponent}</td>
                <td>
                  {match.scorePlayer1} - {match.scorePlayer2}
                </td>
                <td className={isWin ? 'text-success' : 'text-danger'}>
                  {isWin ? 'Win' : 'Loss'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);

export default MatchHistory;