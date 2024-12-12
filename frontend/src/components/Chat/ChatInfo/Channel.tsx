import React, { useEffect } from 'react';

import ChannelMemberList from './ChannelMemberList';
import { ChannelData, MemberData } from '../interfaces';

interface ChannelProps {
  channel: ChannelData;
  selectChannel: (channelID: number | null) => void;
  friends: MemberData[];
  setAlert: (message: string) => void;
  socket: any;
  token: string;
}

const Channel = ({ channel, selectChannel, friends, setAlert, socket, token }: ChannelProps) => {
  useEffect(() => {
    if (channel && !channel.isPrivate) {
      socket.emit('joinChannel', { channelID: channel.ID, token }); // token later uit storage halen
    }

    return () => {
      if (channel && !channel.isPrivate) {
        socket.emit('leaveChannel', { channelID: channel.ID, token });
      }
    };
  }, [channel, socket, token]);

  const leaveChannel = () => {
    socket.emit('leaveChannel', { channelID: channel.ID, token });
    selectChannel(null);
  };

  return (
    <div className="channel-container">
      <div className="channel-header">
        <h2>Channel: {channel?.name}</h2>
        <ChannelMemberList
          channel={channel}
          selectChannel={selectChannel}
          friends={friends}
          setAlert={setAlert}
          token={token}
          socket={socket}
        />
      </div>
      {channel?.isPrivate && <button onClick={leaveChannel}>Leave Channel</button>}
    </div>
  );
};

export default Channel;
