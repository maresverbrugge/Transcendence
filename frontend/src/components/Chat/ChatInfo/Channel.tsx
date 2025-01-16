import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';

import ChannelMemberList from './ChannelMemberList';
import { ChannelData, MemberData } from '../interfaces';
import { emitter } from '../../emitter';

interface ChannelProps {
  channel: ChannelData;
  friends: MemberData[];
  socket: Socket;
}

const Channel = ({ channel, friends, socket }: ChannelProps) => {
  const token = localStorage.getItem('authenticationToken');

  useEffect(() => {
    const handleDisconnect = () => {
      if (channel && !channel.isPrivate) {
        socket.emit('leaveChannel', { channelID: channel.ID, token });
      }
    };

    if (channel && !channel.isPrivate) {
      socket.emit('joinChannel', { channelID: channel.ID, token });
    }

    socket.on('disconnect', handleDisconnect);

    const handleBeforeUnload = () => {
      handleDisconnect();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (channel && !channel.isPrivate) {
        socket.emit('leaveChannel', { channelID: channel.ID, token});
      }
      socket.off('disconnect', handleDisconnect);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [channel, socket]);

  const leaveChannel = () => {
    socket.emit('leaveChannel', { channelID: channel.ID, token});
    emitter.emit('selectChannel', null);
  };

  return (
    <div className="channel-container">
      <div className="channel-header">
        <h2>Channel: {channel?.name}</h2>
        <ChannelMemberList
          channel={channel}
          friends={friends}
          socket={socket}
        />
      </div>
      {channel.isPrivate && <button onClick={leaveChannel}>Leave Channel</button>}
    </div>
  );
};

export default Channel;
