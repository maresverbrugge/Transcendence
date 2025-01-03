import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL -> might remove later?

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NameAvatarStatus from '../components/User/Profile/NameAvatarStatus.tsx';
import FriendActions from '../components/User/Profile/FriendActions.tsx';
import UserInfoAccordion from '../components/User/Shared/UserInfoAccordion.tsx';

interface UserData {
  username: string;
  avatarURL: string;
  status: string;
}

function UserProfile() {
  const userID = parseInt(useParams().userID, 10); // for now, might remove later?
  // console.log('Extracted userID from URL:', userID); // for testing, romove later
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/profile/${userID}`);
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
            <NameAvatarStatus
              username={userData.username}
              avatarURL={userData.avatarURL}
              status={userData.status} />
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
            <FriendActions
              currentUserID={1} // ! NEED TO FIX, this hard coded userID of logged in user
              targetUserID={userID} />
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

export default UserProfile;
