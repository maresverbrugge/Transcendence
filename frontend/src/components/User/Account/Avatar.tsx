import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

function Avatar({ username, currentAvatarURL }) {
  const [avatarURL, setAvatarURL] = useState<string>(currentAvatarURL);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        const token = localStorage.getItem('authenticationToken');
        await axios.post(`http://localhost:3001/user/${token}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
          });
        alert('Avatar uploaded successfully!');

        // After uploading, fetch the updated user data (including the new avatar URL)
        const response = await axios.get(`http://localhost:3001/user/${token}`);
        setAvatarURL(response.data.avatarURL); // Update avatar URL
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    }
  };

  return (
    <div className="avatar">
      {/* Avatar display */}
      <img
        src={avatarURL}
        alt={`${username}'s Avatar`}
        style={{ width: '100px', height: '100px', borderRadius: '45%' }}
      />

      {/* Avatar Upload */}  
      <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button type="submit">Upload Avatar</button>
      </form>
    </div>
  );
};

export default Avatar;
