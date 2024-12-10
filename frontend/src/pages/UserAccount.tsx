import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Username from '../components/User/Account/Username.tsx';
import Avatar from '../components/User/Account/Avatar.tsx';
import Toggle2FA from '../components/User/Account/Toggle2FA.tsx';
import LogOutButton from '../components/User/Account/LogOutButton.tsx';
import UserInfoAccordion from '../components/User/Shared/UserInfoAccordion.tsx';

interface UserData {
  username: string;
  avatarURL: string;
  ID: number;
  Enabled2FA: boolean;
}

const UserAccount = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`http://localhost:3001/user/${token}`);
        console.log('User data fetched:', response.data);
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
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
    <div className="container my-5">
      <div className="row g-4">
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
                <Toggle2FA twoFactorAuthenticationEnabled={userData.Enabled2FA} userID={userData.ID} />
              </div>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <LogOutButton userID={userData.ID} />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <UserInfoAccordion userID={userData.ID} />
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
