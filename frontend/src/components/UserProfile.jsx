import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
  console.log("User ID:", userId);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarURL, setAvatarURL] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data based on userId
    axios.get(`http://localhost:3001/user/${userId}`)
      .then(response => {
        setUserData(response.data);
        setUsername(response.data.username);
        setAvatarURL(response.data.avatarURL);
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
      setUserData(prevData => ({
        ...prevData,
        username: response.data.username,  // Update only new username in user data
    }));
    
      console.log('Username updated successfully', response.data);
      // Optionally update the frontend to reflect the new username
    } catch (err) {
      console.error('Error updating username', err);
    }
  };

  const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
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
              axios.get(`http://localhost:3001/user/${userId}`)
                .then(response => {
                  setUserData(response.data);
                  setAvatarURL(response.data.avatarURL); // Update avatar URL
                })
                .catch(error => {
                  console.error("Error fetching updated user data:", error);
                });
          } catch (error) {
              console.error("Error uploading avatar:", error);
          }
      }
  };

  console.log('{userData.avatarURL} = ', userData.avatarURL);
  
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
