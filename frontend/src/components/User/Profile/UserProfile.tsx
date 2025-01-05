import React, { useEffect, useState } from 'react';
import axios from 'axios';

import NameAvatarStatus from './NameAvatarStatus';
import FriendActions from './FriendActions';
import UserInfoAccordion from '../Shared/UserInfoAccordion';

import Friends from '../Account/Friends'; // remove later, for testing

interface UserData {
  username: string;
  avatarURL: string;
  status: string;
  currentUserID: number;
}

const UserProfile = ({ userID }: { userID: number }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`http://localhost:3001/user/profile/${userID}/${token}`);
        // console.log("User data fetched: ", response.data); // for testing, romove later
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID]);

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
              <NameAvatarStatus username={userData.username} avatarURL={userData.avatarURL} status={userData.status} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <FriendActions
                currentUserID={userData.currentUserID}
                targetUserID={userID}
              />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <UserInfoAccordion userID={userID} />
            </div>
          </div>
        </div>

        {/* Right Column remove later, for testing */}  
        <div className="col-md-3">
          <div className="card shadow">
            <Friends userID={userID} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
