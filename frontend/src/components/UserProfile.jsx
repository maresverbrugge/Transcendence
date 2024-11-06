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

  return (
    <div>
      <h1>{user.username}</h1>
      <img src={user.avatarUrl || 'https://via.placeholder.com/150'} alt={`${user.username}'s avatar`} />
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Update Username"
        />
        <button onClick={() => {/* Update function here */}}>Update Username</button>
      </div>
    </div>
  );
}

export default UserProfile;
