import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Username from '../components/User/Account/Username';
import Avatar from '../components/User/Account/Avatar';
import Toggle2FA from '../components/User/Account/Toggle2FA';
import LogOutButton from '../components/User/Account/LogOutButton';
import UserInfoAccordion from '../components/User/Shared/UserInfoAccordion';

interface UserData {
  ID: number;
  username: string;
  avatarURL: string;
  Enabled2FA: boolean;
}

const UserAccount = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`http://localhost:3001/user/account/${token}`);
        // console.log('User data fetched:', response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        }
        finally {
          setLoading(false);
        }
    };

    fetchUserData();
  }, []);

  const handleUsernameUpdate = (newUsername: string) => {
    if (userData) {
      setUserData({ ...userData, username: newUsername });
      setTriggerRefresh((prev) => !prev);
    }
  };

  const handleAvatarUpdate = (newAvatarURL: string) => {
    if (userData) {
      setUserData({ ...userData, avatarURL: newAvatarURL });
      setTriggerRefresh((prev) => !prev); // Toggle to refresh leaderboard
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>User not found</p>;
  }

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-md-3">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <Avatar
              username={userData.username}
              currentAvatarURL={userData.avatarURL}
              onAvatarUpdate={handleAvatarUpdate} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <Username
              currentUsername={userData.username}
              onUsernameUpdate={handleUsernameUpdate} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-center align-items-center">
              <Toggle2FA
              twoFactorAuthenticationEnabled={userData.Enabled2FA} />
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
          <div className="card shadow">
            <div className="card-body">
              <UserInfoAccordion
              userID={userData.ID}
              triggerRefresh={triggerRefresh}/>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-3">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="text-center">Friends</h4>
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center text-truncate">
                  Alice <span className="badge bg-success">Online</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center text-truncate">
                  Bob <span className="badge bg-secondary">Offline</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center text-truncate">
                  Charlie <span className="badge bg-success">Online</span>
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
