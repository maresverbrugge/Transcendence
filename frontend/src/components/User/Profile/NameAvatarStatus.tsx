import React from 'react';

interface NameAvatarStatusProps {
  username: string;
  avatarURL: string;
  status: string;
}

function NameAvatarStatus({ username, avatarURL, status }: NameAvatarStatusProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-success';
      case 'IN_CHAT':
        return 'bg-info';
      case 'IN_GAME':
        return 'bg-warning';
      case 'OFFLINE':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.toLowerCase().replace('_', ' ');
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
            marginBottom: '5%',
          }}
        />

        {/* Display Name */}
        <h2 style={{ fontSize: '2.5vw', marginBottom: '2%' }}>{`${username}'s`}</h2>
        <h3 style={{ fontSize: '2vw', marginBottom: '10%' }}>profile</h3>

        {/* Display Status */}
        <span
          className={`badge ${getStatusClass(status)}`}
          style={{
            fontSize: '1.2vw',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            textTransform: 'capitalize',
          }}
        >
          {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
}

export default NameAvatarStatus;
