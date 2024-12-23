import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Statistics from './Statistics.tsx';
import Leaderboard from './Leaderboard.tsx';
import MatchHistory from './MatchHistory.tsx';
import { StatisticsData, MatchHistoryData } from '../interfaces';

function UserInfoAccordion({ userID }: { userID: number }) {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [matchHistoryData, setMatchHistoryData] = useState<MatchHistoryData[] | null>(null);
  const [loadingStatistics, setLoadingStatistics] = useState<boolean>(true);
  const [loadingMatchHistory, setLoadingMatchHistory] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userID}/stats`);
        setStatisticsData(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoadingStatistics(false);
      }
    };

    const fetchMatchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userID}/match-history`);
        setMatchHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching match history:', error);
      } finally {
        setLoadingMatchHistory(false);
      }
    };

    fetchStatistics();
    fetchMatchHistory();
  }, [userID]);

  const renderContent = (loading: boolean, data: any, Component: any, noDataMessage: string) => {
    if (loading) {
      return (
        <div className="text-center p-3">
          <p>Loading...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center p-3">
          <p>{noDataMessage}</p>
        </div>
      );
    }

    return <Component {...data} />;
  };

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
            aria-controls="collapseStatistics"
          >
            Statistics
          </button>
        </h2>
        <div
          id="collapseStatistics"
          className="accordion-collapse collapse show"
          aria-labelledby="headingStatistics"
          data-bs-parent="#userAccordion"
        >
          <div className="accordion-body p-0">
            {renderContent(loadingStatistics, { statisticsData }, Statistics, 'No statistics available.')}
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
            aria-controls="collapseMatchHistory"
          >
            Match History
          </button>
        </h2>
        <div
          id="collapseMatchHistory"
          className="accordion-collapse collapse"
          aria-labelledby="headingMatchHistory"
          data-bs-parent="#userAccordion"
        >
          <div className="accordion-body p-0">
            {renderContent(loadingMatchHistory, { matchHistoryData }, MatchHistory, 'No match history available.')}
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
            aria-controls="collapseLeaderboard"
          >
            Leaderboard
          </button>
        </h2>
        <div
          id="collapseLeaderboard"
          className="accordion-collapse collapse"
          aria-labelledby="headingLeaderboard"
          data-bs-parent="#userAccordion"
        >
          <div className="accordion-body p-0">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoAccordion;
