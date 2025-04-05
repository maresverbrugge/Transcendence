import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { emitter } from '../../emitter';
import Statistics from './Statistics';
import Leaderboard from './Leaderboard';
import MatchHistory from './MatchHistory';
import Achievements from './Achievements';
import { StatisticsData, MatchHistoryData, AchievementsData } from '../interfaces';

interface UserInfoAccordionProps {
  userID: number;
  triggerRefresh?: boolean;
}

function UserInfoAccordion({ userID, triggerRefresh }: UserInfoAccordionProps) {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [matchHistoryData, setMatchHistoryData] = useState<MatchHistoryData[]>([]);
  const [achievementsData, setAchievementsData] = useState<AchievementsData[] | null>(null);
  const [loadingStatistics, setLoadingStatistics] = useState<boolean>(true);
  const [loadingMatchHistory, setLoadingMatchHistory] = useState<boolean>(true);
  const [loadingAchievements, setLoadingAchievements] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
    const fetchStatistics = async () => {
        return axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/${userID}/stats/${token}`);
    };

    const fetchMatchHistory = async () => {
        return axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/${userID}/match-history/${token}`);
    };

    const fetchAchievements = async () => {
        return axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/${userID}/achievements/${token}`);
        // console.log('Fetched achievements:', response.data); // Testing, remove later
    };

    const fetchAllData = async () => {
      try {
        let [statistics, matchHistory, achievements] = await Promise.all([fetchStatistics(), fetchMatchHistory(), fetchAchievements()]);
        setStatisticsData(statistics.data);
        setMatchHistoryData(matchHistory.data);
        setAchievementsData(achievements.data);
      } catch (error) {
        emitter.emit("error", error);
      } finally {
        setLoadingStatistics(false);
        setLoadingMatchHistory(false);
        setLoadingAchievements(false);
      }
    }
    fetchAllData();

  }, [userID]);

  const renderContent = (loading: boolean, data: any, Component: any, noDataMessage: string) => {
    if (loading) {
      return (
        <div className="text-center p-3">
          <p>Loading...</p>;
        </div>
      );
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-center p-3">
          <p>{noDataMessage}</p>;
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
            <Leaderboard triggerRefresh={triggerRefresh} />
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
            aria-controls="collapseAchievements"
          >
            Achievements
          </button>
        </h2>
        <div
          id="collapseAchievements"
          className="accordion-collapse collapse"
          aria-labelledby="headingAchievements"
          data-bs-parent="#userAccordion"
        >
          <div className="accordion-body p-0">
            {renderContent(
              loadingAchievements,
              { achievements: achievementsData },
              Achievements,
              'No achievements available.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoAccordion;
