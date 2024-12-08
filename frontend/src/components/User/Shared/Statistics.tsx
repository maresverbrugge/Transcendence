import React from 'react';

interface StatisticsData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalScores: number;
  ladderRank: number;
  // achievements: Achievements;
}

function Statistics({ StatisticsData }: {StatisticsData: StatisticsData}) {
  const { gamesPlayed, wins, losses, ladderRank } = StatisticsData;

  return (
    <div className="card shadow mb-4">
      <div className="card-body">
        <h4 className="card-title text-center mb-4">Statistics</h4>
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between">
            <span>Games Played:</span>
            <span>{gamesPlayed}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Wins:</span>
            <span>{wins}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Losses:</span>
            <span>{losses}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Ladder Rank:</span>
            <span>{ladderRank}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Achievements:</span>
            {/* <span>{achievements}</span> */}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Statistics;
