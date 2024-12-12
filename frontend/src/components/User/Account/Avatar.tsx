import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import axios from 'axios';

interface AvatarProps {
  username: string;
  currentAvatarURL: string;
}

const Avatar = ({ username, currentAvatarURL }: AvatarProps) => {
  const [avatarURL, setAvatarURL] = useState<string>(currentAvatarURL);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [buttonVisible, setButtonVisible] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL); // Cleanup on unmount
      }
    };
  }, [previewURL]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewURL) {
        URL.revokeObjectURL(previewURL); // Revoke previous URL
      }
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setButtonVisible(true);
    }
  };

  const handleCancel = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    setSelectedFile(null);
    setPreviewURL(null);
    setUploadStatus('idle');
    setButtonVisible(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      setUploadStatus('uploading');
      setButtonVisible(false);

      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const token = localStorage.getItem('authenticationToken');
        await axios.post(`http://localhost:3001/user/${token}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUploadStatus('success');

        // Fetch updated avatar
        const response = await axios.get(`http://localhost:3001/user/profile/${token}`);
        setAvatarURL(response.data.avatarURL);
        setPreviewURL(null);
        setSelectedFile(null);
      } catch (error) {
        setUploadStatus('error');
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const isDefaultAvatar = avatarURL === 'http://localhost:3001/images/default-avatar.png';

  return (
    <div className="avatar-component d-flex flex-column align-items-center">
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
        <label className="btn btn-outline-primary btn-sm mb-2">
          Pick New Avatar
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            hidden
          />
        </label>

        {/* Conditional Buttons */}
        {previewURL && buttonVisible && (
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-danger btn-sm me-2"
              onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning btn-sm">
              Upload Avatar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Avatar;
