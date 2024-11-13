import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface UserProfileProps {
  userId: number;
}

interface UserData {
  username: string;
  avatarURL: string;
}

const UserProfile = ({ userId }: UserProfileProps) => {
  console.log("User ID:", userId);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [username, setUsername] = useState<string>('');
  const [avatarURL, setAvatarURL] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user data based on userId
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        console.log("User data fetched:", response.data);
        setUserData(response.data);
        setUsername(response.data.username);
        setAvatarURL(response.data.avatarURL);
        setLoading(false);
      } catch(error){
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChangeUsername = async () => {
    if (!username) {
      alert("Username cannot be empty!");
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:3001/user/${userId}`, {
        username: username,
      });
      setUserData(prevData => ({
        ...prevData!,
        username: response.data.username, // Update only new username in user data
    }));
    
      console.log('Username updated successfully', response.data);
    } catch (err) {
      console.error('Error updating username', err);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();
      if (selectedFile) {
          const formData = new FormData();
          formData.append('avatar', selectedFile);

          try {
            await axios.post(`http://localhost:3001/user/${userId}/avatar`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
              });
            alert('Avatar uploaded successfully!');

            // After uploading, fetch the updated user data (including the new avatar URL)
            const response = await axios.get(`http://localhost:3001/user/${userId}`);
            setUserData(response.data);
            setAvatarURL(response.data.avatarURL); // Update avatar URL
          } catch (error) {
              console.error("Error uploading avatar:", error);
          }
      }
  };

  // Check the user data being returned:
  // console.log('User data:', userData);
  // if (userData)
  //   console.log('userData.avatarURL = ', userData.avatarURL);
  // console.log('avatarURL = ', avatarURL);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>User not found</p>;
  }

  return (
    <div>
      <h1>{userData.username}'s Profile</h1>
     
     {/* Avatar display */}
     <div>
        <img
          src={avatarURL}
          alt="User Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '45%' }}
        />
      </div>

      {/* Avatar Upload */}  
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit">Upload Avatar</button>
      </form>

      {/* Change Username Functionality */}
      <div>
        <input
          type="text"
          placeholder="Change Your Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleChangeUsername}>Change Username</button>
      </div>
    </div>
  );
}

export default UserProfile;
