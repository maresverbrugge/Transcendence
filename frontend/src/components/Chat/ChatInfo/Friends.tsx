import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './Friends.css';
import { MemberData } from '../interfaces';

interface FriendProps {
  key: number;
  friend: MemberData;
  socket: any;
}

interface FriendsProps {
  friends: MemberData[];
  setFriends: (friends: MemberData[]) => void;
  socket: any;
  token: string;
}

const Friend = ({ friend, socket }: FriendProps) => {
  const [status, setStatus] = useState('friend-offline');

  useEffect(() => {
    const getStatusClass = (userStatus: string) => {
      switch (userStatus) {
        case 'ONLINE':
          return 'friend-online';
        case 'OFFLINE':
          return 'friend-offline';
        case 'IN_GAME':
          return 'friend-ingame';
        case 'AFK':
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

const Friends = ({ friends, setFriends, socket, token }: FriendsProps) => {
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/chat/friends/${token}`);
        if (response.data) setFriends(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) console.error('User not found');
        else console.error('An error occurred', error);
      }
    };

    fetchFriends();
  }, [setFriends, socket, token]);

  return (
    <div className="friends-container">
      <h1>Friends</h1>
      <ul className="friends">
        {friends.map((friend) => (
          <Friend key={friend.ID} friend={friend} socket={socket} />
        ))}
      </ul>
    </div>
  );
};

export default Friends;
