import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL
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
  const { ID } = useParams<{ ID: string}>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user data based on ID
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${ID}`);
        console.log("User data fetched:", response.data);
        setUserData(response.data);
        setLoading(false);
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
    return <p>User not found</p>;
  }

  return (
    <div className="user-account">
      <h1>Your Account</h1>
      <Username userID={ID} currentUsername={userData.username}/>
      <br/><Avatar userID={ID} username={userData.username} currentAvatarURL={userData.avatarURL}/>
      <Toggle2FA userID={ID}/>
      <br/>
      <LogOut />

      {/* <Achievements userID=ID />
      <LeaderBoard userID={currentID} />
      <Statistics userID={currentID} />
      <MatchHistory userID={currentID} /> */}
       
    </div>
  );
};

export default UserAccount;