import React from 'react';
import { StatisticsData } from '../interfaces.tsx'

const Statistics = ({ statisticsData }: {statisticsData: StatisticsData}) => {

  return (
    <div className="p-4">
      <h5 className="text-center mb-2 ">Statistics</h5>

      <table className="table table-sm table-striped">
        <tbody>
          <tr>
            <td><strong>Games Played:</strong></td>
            <td className="text-end">{statisticsData.gamesPlayed}</td>
          </tr>
          <tr>
            <td><strong>Wins:</strong></td>
            <td className="text-end">{statisticsData.wins}</td>
          </tr>
          <tr>
            <td><strong>Losses:</strong></td>
            <td className="text-end">{statisticsData.losses}</td>
          </tr>
          <tr>
            <td><strong>Total Scores:</strong></td>
            <td className="text-end">{statisticsData.totalScores}</td>
          </tr>
          <tr>
            <td><strong>Ladder Rank:</strong></td>
            <td className="text-end">{statisticsData.ladderRank}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  
}

export default Statistics;
