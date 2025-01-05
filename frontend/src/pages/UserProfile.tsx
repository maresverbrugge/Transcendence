import { useParams, useNavigate } from 'react-router-dom'; // extract dynamic parameters from the current URL -> might remove later?
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import NameAvatarStatus from '../components/User/Profile/NameAvatarStatus';
import FriendActions from '../components/User/Profile/FriendActions';
import UserInfoAccordion from '../components/User/Shared/UserInfoAccordion';

import Friends from '../components/User/Account/Friends'; // remove later, for testing

interface UserData {
  username: string;
  avatarURL: string;
  status: string;
}

function UserProfile() {
  const { userID } = useParams<{ userID: string }>();
  // const userID = parseInt(useParams().userID, 10); // for now, might remove later?
  const navigate = useNavigate();
  console.log('Extracted userID from URL:', userID); // for testing, romove later
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const { data: currentUserID } = await axios.get<number>(`http://localhost:3001/${token}`);
        if (parseInt(userID, 10) === currentUserID) {
          navigate('/account'); // Redirect to UserAccount if viewing own profile
          return;
        }
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
                currentUserID={1} // ! NEED TO FIX, this hard coded userID of logged in user
                targetUserID={parseInt(userID, 10)}
              />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <UserInfoAccordion userID={parseInt(userID, 10)} />
            </div>
          </div>
        </div>

        {/* Right Column remove later, for testing */}  
        <div className="col-md-3">
          <div className="card shadow">
            <Friends userID={parseInt(userID, 10)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
