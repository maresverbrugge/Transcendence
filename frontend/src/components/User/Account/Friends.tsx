import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        console.error('Error fetching friends:', error);
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
    <div className="card shadow">
      <div className="card-body">
        <h4 className="text-center">Friends</h4>
        <ul className="list-group">
          {friends.map((friend) => (
            <li
              key={friend.ID}
              className="list-group-item d-flex align-items-center"
                style={{ padding: '0.2rem 1rem', gap: '0.5rem' }}>
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                <img
                  src={friend.avatarURL}
                  alt={`${friend.username}'s avatar`}
                  className="rounded-circle"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ flex: 1 }}>
                  <button
                    onClick={() => navigate(`/profile/${friend.ID}`)}
                    className="btn btn-link p-0"
                    style={{ textDecoration: 'none' }}>
                    {friend.username}
                  </button>
                  </span>
              </div>
              <span className={`badge ${getStatusClass(friend.status)} ms-auto`}>
                {friend.status.toLowerCase().replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Friends;
