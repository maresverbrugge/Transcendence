import React, { useEffect, useState } from 'react';
import axios from 'axios';

import GoBackButton from '../../GoBackButton';
import NameAvatarStatus from './NameAvatarStatus';
import FriendActions from './FriendActions';
import UserInfoAccordion from '../Shared/UserInfoAccordion';

interface UserData {
  currentUserID: number;
  profileID: number;
  username: string;
  avatarURL: string;
  status: string;
}

const UserProfile = ({ profileUserID }: { profileUserID: number }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/${profileUserID}/${token}`);
        // console.log("User data fetched: ", response.data); // for testing, romove later
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [profileUserID]);

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
        <div className="col-md-4">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              {/* Display Name, Avatar, and Status */}
              <NameAvatarStatus username={userData.username} avatarURL={userData.avatarURL} status={userData.status} />
            </div>
          </div>
          <div className="card shadow">
            <div className="card-body">
              {/* Add Friend/Unfriend Button */}
              <FriendActions
                targetUserID={userData.profileID}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              {/* Accordion showing User Info */}
              <UserInfoAccordion userID={userData.profileID} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
