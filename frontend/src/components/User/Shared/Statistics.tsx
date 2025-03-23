import React from 'react';

import { StatisticsData } from '../interfaces';

const Statistics = ({ statisticsData }: { statisticsData: StatisticsData }) => {
  return (
    <div className="px-3 py-3">
    <h2 className="text-center mb-3">Statistics</h2>

      <table className="table table-hover align-middle">
    <tbody>
      <tr>
        <td className="fw-bold">Games Played</td>
        <td className="text-end">{statisticsData.gamesPlayed}</td>
      </tr>
      <tr>
        <td className="fw-bold">Wins</td>
        <td className="text-end">{statisticsData.wins}</td>
      </tr>
      <tr>
        <td className="fw-bold">Losses</td>
        <td className="text-end">{statisticsData.losses}</td>
      </tr>
      <tr>
        <td className="fw-bold">Total Scores</td>
        <td className="text-end">{statisticsData.totalScores}</td>
      </tr>
      <tr>
        <td className="fw-bold">Win Rate</td>
        <td className="text-end">{(statisticsData.winRate * 100).toFixed(0)}%</td>
      </tr>
      <tr>
        <td className="fw-bold">Player Rating</td>
        <td className="text-end">{statisticsData.ladderRank} XP</td>
      </tr>
    </tbody>
  </table>
    </div>
  );
};

export default Statistics;
