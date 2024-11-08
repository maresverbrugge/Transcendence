import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
  console.log("User ID:", userId);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data based on userId
    axios.get(`http://localhost:3001/user/${userId}`)
      .then(response => {
        setUserData(response.data);
        setUsername(response.data.username);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, [userId]);

  const handleChangeUsername = async () => {
    if (!username) {
      setError("Username cannot be empty");
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:3001/user/${userId}`, {
        username: username,
      });
      setUserData(response.data); // Update user data with the new username
      console.log('Username updated successfully', response.data);
      // Optionally update the frontend to reflect the new username
    } catch (err) {
      console.error('Error updating username', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>User not found</p>;
  }

  // URL for the default avatar stored on your backend
  let avatarURL = 'http://localhost:3001/images/default-avatar.png';
  if (userData.avatar)
    avatarURL = `data:image/png;base64,${userData.avatar.toString('base64')}`;

  return (
    <div>
      <h1>{userData.username}'s Profile</h1>
     
     {/* Avatar display */}
     <div>
        <img
          src={avatarURL}
          alt="User Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%' }}
        />
      </div>

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
