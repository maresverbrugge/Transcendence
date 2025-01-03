import React, { useEffect } from 'react';
import { Socket } from 'socket.io-client';

import ChannelMemberList from './ChannelMemberList';
import { ChannelData, MemberData } from '../interfaces';
import { emitter } from '../emitter';

interface ChannelProps {
  channel: ChannelData;
  friends: MemberData[];
  socket: Socket;
  token: string
}

const Channel = ({ channel, friends, socket, token }: ChannelProps) => {
  useEffect(() => {
    
    if (channel && !channel.isPrivate) {
      socket.emit('joinChannel', { channelID: channel.ID, token });
    }

    return () => {
      if (channel && !channel.isPrivate) {
        socket.emit('leaveChannel', { channelID: channel.ID, token});
      }
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
          token={token}
        />
      </div>
      {channel.isPrivate && <button onClick={leaveChannel}>Leave Channel</button>}
    </div>
  );
};

export default Channel;
