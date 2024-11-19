import React, { useState } from 'react';
import axios from 'axios';

function Username({ userID, currentUsername }) {
  const [username, setUsername] = useState<string>(currentUsername);
  
  const handleChangeUsername = async () => {
    if (!username.trim()) {
      alert("Username cannot be empty!");
      return;
    }
    try {
      const response = await axios.patch(`http://localhost:3001/user/${userID}`, {
        username: username.trim(),
      });
      alert("Username updated successfully!");
      console.log('Username updated successfully', response.data);
    } catch (err) {
      console.error('Error updating username', err);
      alert("Failed to update username. Please try again.");
    }
  };

  return (
    <div className="username">
      <h2>Username: {username}</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter new username"
      />
      <button onClick={handleChangeUsername}> Change Username</button>
    </div>
  );
}

export default Username;
