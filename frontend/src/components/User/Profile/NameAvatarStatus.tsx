import React from 'react';

interface NameAvatarStatusProps {
    username: string;
    avatarURL: string;
    status: string;
}

function NameAvatarStatus({ username, avatarURL, status }: NameAvatarStatusProps) {
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
        return "unknown";
    }
  };

  return (
    <div className="name-avatar-status">
      <div className="text-center">
      {/* Display Avatar */}
      <img
        src={avatarURL}
        alt={`${username}'s Avatar`}
        style={{
          width: '50%',
          height: 'auto',
          borderRadius: '50%',
          marginBottom: '5%', }} />

      {/* Display Name */}
      <h2 style={{ fontSize: '2.5vw', marginBottom: '2%' }}>{username}'s</h2>
      <h3 style={{ fontSize: '2vw', marginBottom: '10%' }}>profile</h3>

      {/* Display Status */}
      <p style={{ fontSize: '1.5vw', fontWeight: 'bold' }}>{getStatusLabel(status)}</p>
      </div>
    </div>
  );
}

export default NameAvatarStatus;
