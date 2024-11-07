import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
  console.log("User ID:", userId);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }

    // Fetch user data based on userId
    axios.get(`http://localhost:3001/user/${userId}`)
      .then(response => {
        setUser(response.data);
        setUsername(response.data.username);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  const handleChangeUsername = async () => {
    try {
      const response = await axios.patch(`http://localhost:3001/user/${userId}`, {
        username: username,
      });
      console.log('Username updated successfully', response.data);
      // Optionally update the frontend to reflect the new username
    } catch (err) {
      console.error('Error updating username', err);
    }
  };

  return (
    <div>
      <h1>{user.username}</h1>
     
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
