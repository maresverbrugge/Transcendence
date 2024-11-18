import React from 'react';

interface NameAvatarStatusProps {
    username: string;
    avatarURL: string;
    status: string;
}

function NameAvatarStatus({ username, avatarURL, status }: NameAvatarStatusProps) {
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
        <p>Status: {status}</p>
      </div>
    );
  };
  
export default NameAvatarStatus;