import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import axios from 'axios';
import { emitter } from '../../emitter';

interface AvatarProps {
  username: string;
  currentAvatarURL: string;
  onAvatarUpdate: (newAvatarURL: string) => void;
}

const Avatar = ({ username, currentAvatarURL, onAvatarUpdate }: AvatarProps) => {
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
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Invalid file type. Only JPEG and PNG are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
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
        await axios.post(`${process.env.REACT_APP_URL_BACKEND}/user/avatar/${token}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Fetch updated avatar
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/account/${token}`);
        const newAvatarURL = response.data.avatarURL;
        setAvatarURL(newAvatarURL);
        onAvatarUpdate(newAvatarURL);
        setPreviewURL(null);
        setSelectedFile(null);
        setUploadStatus('success');
      } catch (error) {
        emitter.emit("error", error);
        setUploadStatus('error');
      }
    }
  };

  const isDefaultAvatar = avatarURL === `${process.env.REACT_APP_URL_BACKEND}/images/default-avatar.png`;

  return (
    <div className="avatar-component d-flex flex-column align-items-center p-2">
      {/* Avatar Display */}
      <img
        src={previewURL || avatarURL}
        alt={`${username}'s Avatar`}
        className="rounded-circle mb-3"
        style={{
          width: '10vw',
          height: '10vw',
          objectFit: previewURL ? 'cover' : isDefaultAvatar ? 'contain' : 'cover',
          backgroundColor: isDefaultAvatar ? '#f8f9fa' : 'transparent',
          padding: isDefaultAvatar ? '2%' : '0',
        }}
      />

      {/* Upload Feedback */}
      {uploadStatus === 'uploading' && <p className="text-info mb-2">Uploading...</p>}
      {uploadStatus === 'success' && <p className="text-success mb-2">Upload successful!</p>}
      {uploadStatus === 'error' && <p className="text-danger mb-2">Upload failed. Try again.</p>}

      {/* File Input */}
      <form onSubmit={handleSubmit} className="text-center  w-100">
        <label className="btn btn-outline-primary btn-lg w-100 mb-2">
          Choose New Avatar
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
        </label>

        
        {/* Conditional Buttons */}
        {previewURL && buttonVisible && (
          <div className="d-flex justify-content-center gap-2 mt-2">
            <button type="button" className="btn btn-danger btn-lg" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning btn-lg">
              Upload Avatar
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Avatar;
