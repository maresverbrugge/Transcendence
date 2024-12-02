import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import axios from 'axios';

function Avatar({ username, currentAvatarURL }: { username: string; currentAvatarURL: string }) {
  const [avatarURL, setAvatarURL] = useState<string>(currentAvatarURL);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for resetting input value

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input value to allow reselecting the same file
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const token = localStorage.getItem('authenticationToken');
        await axios.post(`http://localhost:3001/user/${token}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUploadStatus('success');

        // Fetch updated avatar
        const response = await axios.get(`http://localhost:3001/user/${token}`);
        setAvatarURL(response.data.avatarURL); // Update avatar URL
        setPreviewURL(null); // Clear preview
        setSelectedFile(null); // Clear selected file
      } catch (error) {
        setUploadStatus('error');
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const isDefaultAvatar = avatarURL === 'http://localhost:3001/images/default-avatar.png';

  return (
    <div className="d-flex flex-column align-items-center">
      {/* Avatar Display */}
      <img
        src={previewURL || avatarURL}
        alt={`${username}'s Avatar`}
        className="rounded-circle mb-3"
        style={{
          width: '120px',
          height: '120px',
          objectFit: previewURL ? 'cover' : isDefaultAvatar ? 'contain' : 'cover',
          backgroundColor: isDefaultAvatar ? '#f8f9fa' : 'transparent',
          padding: isDefaultAvatar ? '5px' : '0',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      />

      {/* Upload Feedback */}
      {uploadStatus === 'uploading' && <p className="text-info mb-2">Uploading...</p>}
      {uploadStatus === 'success' && <p className="text-success mb-2">Upload successful!</p>}
      {uploadStatus === 'error' && <p className="text-danger mb-2">Upload failed. Try again.</p>}

      {/* File Input */}
      <form onSubmit={handleSubmit} className="text-center">
        <label className="btn btn-secondary btn-sm mb-2">
          Pick New Avatar
          <input
            type="file"
            ref={fileInputRef} // Attach ref to the input
            onChange={handleFileChange}
            accept="image/*"
            hidden
          />
        </label>

        {/* Conditional Buttons */}
        {previewURL && (
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-danger btn-sm me-2"
              onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning btn-sm  me-2">
              Upload Avatar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Avatar;
