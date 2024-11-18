import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL
import axios from 'axios';
// import TwoFAToggle from '../components/User/Account/TwoFAToggle.tsx';
// import Avatar from '../components/User/Account/Avatar.tsx';
// import LogOut from '../components/User/Account/LogOut.tsx';
import Username from '../components/User/Account/Username.tsx';
// import Achievements from '../components/User/Shared/Achievements.tsx';
// import LeaderBoard from '../components/User/Shared/LeaderBoard.tsx';
// import MatchHistory from '../components/User/Shared/MatchHistory.tsx';
// import Statistics from '../components/User/Shared/Statistics.tsx';

interface UserData {
  username: string;
  avatarURL: string;
  status: string;
}

function UserAccount() {
  const { ID } = useParams<{ ID: string}>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [username, setUsername] = useState<string>('');
  // const [avatarURL, setAvatarURL] = useState<string>('');
  // const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user data based on ID
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${ID}`);
        console.log("User data fetched:", response.data);
        setUserData(response.data);
        setUsername(response.data.username);
        // setAvatarURL(response.data.avatarURL);
        // setIsTwoFactorEnabled(response.data.twoFactorEnabled);
        setLoading(false);
      } catch(error){
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [ID]);

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files) {
  //     setSelectedFile(event.target.files[0]);
  //   }
  // };

  // const handleSubmit = async (event: FormEvent) => {
  //     event.preventDefault();
  //     if (selectedFile) {
  //         const formData = new FormData();
  //         formData.append('avatar', selectedFile);

  //         try {
  //           await axios.post(`http://localhost:3001/user/${userId}/avatar`, formData, {
  //             headers: { 'Content-Type': 'multipart/form-data' }
  //             });
  //           alert('Avatar uploaded successfully!');

  //           // After uploading, fetch the updated user data (including the new avatar URL)
  //           const response = await axios.get(`http://localhost:3001/user/${userId}`);
  //           setUserData(response.data);
  //           setAvatarURL(response.data.avatarURL); // Update avatar URL
  //         } catch (error) {
  //             console.error("Error uploading avatar:", error);
  //         }
  //     }
  // };

  // const handleToggleTwoFactor = async () => {
  //   try {
  //     const response = await axios.patch(`http://localhost:3001/user/${userId}/2fa`, {
  //       enable: !isTwoFactorEnabled,
  //     });
  //     setIsTwoFactorEnabled(response.data.Enabled2FA); // Update 2FA status
  //     console.log('2FA status updated successfully', response.data);
  //   } catch (error) {
  //     console.error('Error toggling 2FA:', error);
  //   }
  // };

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

        {/* <Avatar avatarURL={userData.avatarURL}/>
        <TwoFAToggle />
        <LogOut />

        <Achievements userID=ID />
        <LeaderBoard userID={currentID} />
        <Statistics userID={currentID} />
        <MatchHistory userID={currentID} />
        */}
    </div>
  );
};

export default UserAccount;