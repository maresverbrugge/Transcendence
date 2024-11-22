import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Username from '../components/User/Account/Username.tsx';
import Avatar from '../components/User/Account/Avatar.tsx';
import Toggle2FA from '../components/User/Account/Toggle2FA.tsx';
import LogOut from '../components/User/Account/LogOut.tsx';
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

  const renderContent = () => {
    switch (section) {
      case "Statistics":
        return <p>Statistics Content</p>;
      case "Match History":
        return <p>Match History Content</p>;
      case "Leaderboard":
        return <p>Leaderboard Content</p>;
      case "Achievements":
        return <p>Achievements Content</p>;
      default:
        return <p>Select a section to display data here.</p>;
    }
  };

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
              <Toggle2FA  />
            </div>
          </div>
          <button className="btn btn-danger w-100">Log Out</button>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center">User Information</h3>
              <div className="dropdown text-center mt-3">
                <button
                  className="btn btn-primary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Choose Section
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><a className="dropdown-item" href="#" onClick={() => setSection("Statistics")}>Statistics</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSection("Match History")}>Match History</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSection("Leaderboard")}>Leaderboard</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setSection("Achievements")}>Achievements</a></li>
                </ul>
              </div>
              <div id="dynamic-content" className="mt-4">
                {renderContent()}
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