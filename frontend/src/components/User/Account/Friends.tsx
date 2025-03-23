import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { emitter } from '../../emitter';

interface FriendData {
  ID: number;
  username: string;
  avatarURL: string;
  status: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/friends/${token}`);
        setFriends(response.data);
      } catch (error) {
        emitter.emit("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

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

  if (loading) {
    return (
      <div className="text-center p-3">
        <p>Loading friends...</p>
      </div>
    );
  }

  if (!friends.length) {
    return (
      <div className="text-center p-3">
        <p>No friends found! </p>
        <p>Go on and make some, don't be shy, you can do it! </p>
      </div>
    );
  }

  return (
    <>
    {/* Scoped CSS for pulse animation */}
    <style>
      {`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        .status-indicator {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}
    </style>

    <div className="px-3 py-3">
      <h2 className="text-center mb-3">Friends</h2>

      {/* Legend for status colors */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-3 text-center">
        <small className="d-flex align-items-center gap-1">
          <span className="rounded-circle bg-success" style={{ width: '0.75em', height: '0.75em' }}></span> Online
        </small>
        <small className="d-flex align-items-center gap-1">
          <span className="rounded-circle bg-info" style={{ width: '0.75em', height: '0.75em' }}></span> In Chat
        </small>
        <small className="d-flex align-items-center gap-1">
          <span className="rounded-circle bg-warning" style={{ width: '0.75em', height: '0.75em' }}></span> In Game
        </small>
        <small className="d-flex align-items-center gap-1">
          <span className="rounded-circle bg-danger" style={{ width: '0.75em', height: '0.75em' }}></span> Offline
        </small>
      </div>

      <ul className="list-group">
        {friends.map((friend) => (
          <li
            key={friend.ID}
            className="list-group-item d-flex align-items-center justify-content-between"
            style={{ padding: '0.5em 1em' }}
          >
            <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
              <img
                src={friend.avatarURL}
                alt={`${friend.username}'s avatar`}
                className="rounded-circle"
                style={{ width: '2.2em', height: '2.2em', objectFit: 'cover' }}
              />
              <button
                onClick={() => navigate(`/profile/${friend.ID}`)}
                className="btn btn-link p-0 text-truncate text-start"
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  color: 'white',
                  textDecoration: 'none',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  flexShrink: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--bs-primary)';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                <span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>
                  {friend.username}
                </span>
              </button>
            </div>
            <span
                className={`rounded-circle ms-2 ${getStatusClass(friend.status)} status-indicator`}
                style={{ width: '0.75em', height: '0.75em', display: 'inline-block' }}
              />
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default Friends;
