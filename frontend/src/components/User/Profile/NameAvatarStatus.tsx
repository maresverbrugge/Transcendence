import React from 'react';

interface NameAvatarStatusProps {
    username: string;
    avatarURL: string;
    status: string;
}

function NameAvatarStatus({ username, avatarURL, status }: NameAvatarStatusProps) {
    // Map the backend statuses to user-friendly formats
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "ONLINE":
        return "online";
      case "OFFLINE":
        return "offline";
      case "IN_GAME":
        return "in game";
      case "IN_CHAT":
        return "in chat";
      default:
        return "unknown"; // Fallback for unexpected statuses
    }
  };
    
  return (
    <div className="name-avatar-status">
      {/* Display Avatar */}
      <img
        src={avatarURL}
        alt={`${username}'s Avatar`}
        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
      />
      
      {/* Display Name */}
      <h3>{username}'s Profile</h3>

      {/* Display Status */}
      <p>Status: {getStatusLabel(status)}</p>
    </div>
  );
};

export default NameAvatarStatus;