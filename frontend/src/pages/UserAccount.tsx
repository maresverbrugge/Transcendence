import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Username from '../components/User/Account/Username.tsx';
import Avatar from '../components/User/Account/Avatar.tsx';
import Toggle2FA from '../components/User/Account/Toggle2FA.tsx';
import LogOutButton from '../components/User/Account/LogOutButton.tsx';
// import Achievements from '../components/User/Shared/Achievements.tsx';
// import LeaderBoard from '../components/User/Shared/LeaderBoard.tsx';
// import MatchHistory from '../components/User/Shared/MatchHistory.tsx';
// import Statistics from '../components/User/Shared/Statistics.tsx';

interface UserData {
  username: string;
  avatarURL: string;
}

function UserAccount() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [section, setSection] = useState<string>("");

  useEffect(() => {
    // Fetch user data based on token
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`http://localhost:3001/user/${token}`);
        console.log("User data fetched:", response.data);
        setUserData(response.data);
        setLoading(false);
      } catch(error){
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>User not found</p>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Left Column */}
        <div className="col-md-3">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <Avatar username={userData.username} currentAvatarURL={userData.avatarURL} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <Username currentUsername={userData.username} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-center align-items-center">
              <Toggle2FA twoFactorAuthenticationEnabled={userData.Enabled2FA} />
              </div>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <LogOutButton />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
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
                  <p>Statistics Content</p>
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
        </div>

        {/* Right Column */}
        <div className="col-md-3">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="text-center">Friends</h4>
              <ul className="list-group">
                {/* Mock friend list */}
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Alice
                  <span className="badge bg-success">Online</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Bob
                  <span className="badge bg-secondary">Offline</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Charlie
                  <span className="badge bg-success">Online</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAccount;
