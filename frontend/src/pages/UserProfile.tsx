import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL
import axios from 'axios';
// import BlockActions from '../components/User/Profile/BlockActions.tsx';
// import FriendActions from '../components/User/Profile/FriendActions.tsx';
import NameAvatarStatus from '../components/User/Profile/NameAvatarStatus.tsx';
// import Achievements from '../components/User/Shared/Achievements.tsx';
// import LeaderBoard from '../components/User/Shared/LeaderBoard.tsx';
// import MatchHistory from '../components/User/Shared/MatchHistory.tsx';
// import Statistics from '../components/User/Shared/Statistics.tsx';

interface UserData {
  username: string;
  avatarURL: string;
  status: string;
}

function UserProfile() {
  const { ID } = useParams<{ ID: string}>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user data based on ID
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${ID}`);
        setUserData(response.data);
        setLoading(false);
        console.log("User data fetched:", response.data);
      } catch(error){
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [ID]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return (
      <div>
        <p>User not found</p>
        <p>so NO USER PROFILE to display</p>
      </div>);
  }

  return (
    <div className="user-profile">
      <NameAvatarStatus
        username={userData.username}
        avatarURL={userData.avatarURL}
        status={userData.status} />
        {/* <BlockActions />
        <FriendActions />
        <Achievements userID={currentID} />
        <LeaderBoard userID={currentID} />
        <Statistics userID={currentID} />
        <MatchHistory userID={currentID} /> */}
    </div>
  );
}

export default UserProfile;