import React from 'react';
import { StatisticsData } from '../interfaces.tsx'

const Statistics = ({ statisticsData }: {statisticsData: StatisticsData}) => {

  return (
    <div className="card shadow mb-4">
      <div className="card-body">
        <h4 className="card-title text-center mb-4">Statistics</h4>
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between">
            <span>Games Played:</span>
            <span>{statisticsData.gamesPlayed}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Wins:</span>
            <span>{statisticsData.wins}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Losses:</span>
            <span>{statisticsData.losses}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Total Scores:</span>
            <span>{statisticsData.totalScores}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Ladder Rank:</span>
            <span>{statisticsData.ladderRank}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Achievements:</span>
            {/* <span>{statisticsData.achievements}</span> */}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Statistics;
