import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Statistics from './Statistics.tsx';

interface StatisticsData {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalScores: number;
  ladderRank: number;
  // achievements: Achievements;
}

const UserInfoAccordion = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`http://localhost:3001/user/${token}/stats`);
        console.log('Statistics data fetched:', response.data);
        setStatisticsData(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="accordion" id="userAccordion">
      {/* Accordion Item: Statistics */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingStatistics">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseStatistics"
            aria-expanded="true"
            aria-controls="collapseStatistics">
            Statistics
          </button>
        </h2>
        <div
          id="collapseStatistics"
          className="accordion-collapse collapse show"
          aria-labelledby="headingStatistics"
          data-bs-parent="#userAccordion">
          <div className="accordion-body">
            {loading ? (
              <p>Loading statistics...</p>
            ) : statisticsData ? (
              <Statistics StatisticsData={statisticsData} />
            ) : (
              <p>No statistics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Item: Match History */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingMatchHistory">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseMatchHistory"
            aria-expanded="false"
            aria-controls="collapseMatchHistory">
            Match History
          </button>
        </h2>
        <div
          id="collapseMatchHistory"
          className="accordion-collapse collapse"
          aria-labelledby="headingMatchHistory"
          data-bs-parent="#userAccordion">
          <div className="accordion-body">
            <p>Match History Content</p>
          </div>
        </div>
      </div>

      {/* Accordion Item: Leaderboard */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingLeaderboard">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseLeaderboard"
            aria-expanded="false"
            aria-controls="collapseLeaderboard">
            Leaderboard
          </button>
        </h2>
        <div
          id="collapseLeaderboard"
          className="accordion-collapse collapse"
          aria-labelledby="headingLeaderboard"
          data-bs-parent="#userAccordion">
          <div className="accordion-body">
            <p>Leaderboard Content</p>
          </div>
        </div>
      </div>

      {/* Accordion Item: Achievements */}
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingAchievements">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseAchievements"
            aria-expanded="false"
            aria-controls="collapseAchievements">
            Achievements
          </button>
        </h2>
        <div
          id="collapseAchievements"
          className="accordion-collapse collapse"
          aria-labelledby="headingAchievements"
          data-bs-parent="#userAccordion">
          <div className="accordion-body">
            <p>Achievements Content</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoAccordion;