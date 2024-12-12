import React from 'react';

import Friends from './Friends';
import './ChatInfo.css';
import { ChannelData, MemberData } from '../interfaces';
import Channel from './Channel';
import DM from './DM';

interface ChannelInfoProps {
  channel: ChannelData;
  selectChannel: (channel: number | null) => void;
  friends: MemberData[];
  setAlert: (message: string) => void;
  token: string;
  socket: any;
}

interface ChatInfoProps {
  channel: ChannelData | null;
  selectChannel: (channel: number | null) => void;
  friends: MemberData[];
  setFriends: (friends: MemberData[]) => void;
  setAlert: (message: string) => void;
  socket: any;
  token: string;
}

const ChannelInfo = ({ channel, selectChannel, friends, setAlert, token, socket }: ChannelInfoProps) => {
  return (
    <div className="channel-info">
      {channel.isDM ? (
        <DM channel={channel} token={token} />
      ) : (
        <Channel
          channel={channel}
          selectChannel={selectChannel}
          friends={friends}
          setAlert={setAlert}
          socket={socket}
          token={token}
        />
      )}
    </div>
  );
};

const ChatInfo = ({ channel, selectChannel, friends, setFriends, setAlert, socket, token }: ChatInfoProps) => {
  return (
    <div className="chat-info-container">
      {channel === null ? (
        <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
      ) : (
        <ChannelInfo
          channel={channel}
          selectChannel={selectChannel}
          friends={friends}
          setAlert={setAlert}
          token={token}
          socket={socket}
        />
      )}
    </div>
  );
};

export default ChatInfo;
