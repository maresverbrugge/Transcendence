import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { FriendData } from '../interfaces';

import { emitter } from '../../emitter';

interface FriendProps {
  key: number;
  friend: FriendData;
  socket: Socket;
}

interface FriendsProps {
  friends: FriendData[];
  setFriends: (friends: FriendData[]) => void;
  socket: Socket;
}

const Friend = ({ friend, socket }: FriendProps) => {
  const [status, setStatus] = useState('friend-offline');

  useEffect(() => {
    const getStatusClass = (userStatus: string) => {
      switch (userStatus) {
        case 'ONLINE':
          return 'friend-afk';
        case 'OFFLINE':
          return 'friend-offline';
        case 'IN_CHAT':
          return 'friend-online';
        case 'IN_GAME':
          return 'friend-afk';
        default:
          return 'friend-offline';
      }
    };

    socket.on('userStatusChange', (userID: number, userStatus: string) => {
      if (friend.ID === userID) setStatus(getStatusClass(userStatus));
    });

    setStatus(getStatusClass(friend.status));

    return () => {
      socket.off('userStatusChange');
    };
  }, [friend.ID, friend.status, socket]);

  return <li className={status}>{friend.username}</li>;
};

const Friends = ({ friends, setFriends, socket }: FriendsProps) => {
  const token = localStorage.getItem('authenticationToken');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL_BACKEND}/user/friends/${token}`);
        if (response.data) setFriends(response.data);
      } catch (error) {
        emitter.emit('error', error);
      }
    };

    fetchFriends();
  }, [setFriends, socket]);

  return (
    <div className="friends-container">
      <h1>Friends</h1>
      <ul className="friends" style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {friends.map((friend) => (
          <Friend key={friend.ID} friend={friend} socket={socket} />
        ))}
      </ul>
    </div>
  );
};

export default Friends;
