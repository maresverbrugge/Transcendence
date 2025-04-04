import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { emitter } from '../../emitter';
import GoBackButton from '../../GoBackButton';
import Username from './Username';
import Avatar from './Avatar';
import Toggle2FA from './Toggle2FA';
import LogOutButton from './LogOutButton';
import UserInfoAccordion from '../Shared/UserInfoAccordion';
import Friends from './Friends';

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
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/account/${token}`);
        setUserData(response.data);
      } catch (error) {
        emitter.emit("error", error);
      } finally {
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
       {/* Back Button */}
       <GoBackButton />
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-md-3">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <Avatar
                username={userData.username}
                currentAvatarURL={userData.avatarURL}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <Username currentUsername={userData.username} onUsernameUpdate={handleUsernameUpdate} />
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
              <LogOutButton buttonStyle="btn-outline-danger" />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <UserInfoAccordion userID={userData.ID} triggerRefresh={triggerRefresh} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-3">
          <div className="card shadow">
            <Friends />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
