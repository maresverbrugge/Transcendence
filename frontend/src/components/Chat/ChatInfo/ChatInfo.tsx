import React, { useEffect, useState } from 'react';

import Friends from './Friends';
import './ChatInfo.css';
import { ChannelData, MemberData } from '../interfaces';
import Channel from './Channel';
import DM from './DM';
import axios from 'axios';
import { emitter } from '../emitter';


interface ChannelInfoProps {
  channelID: number;
  friends: MemberData[];
  socket: any;
  token: string;
}

interface ChatInfoProps {
  channelID: number | null;
  friends: MemberData[];
  setFriends: (friends: MemberData[]) => void;
  socket: any;
  token: string;
}

const ChannelInfo = ({ channelID, friends, socket, token }: ChannelInfoProps) => {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ChannelData>(`http://localhost:3001/chat/channel/${channelID}`);
        setChannel(response.data);
      } catch (error) {
        emitter.emit('error', error);
      } finally {
        setLoading(false);
      }
    };

      fetchChannelInfo();
  }, [channelID]);

  if (loading) {
    return <div>Loading channel...</div>;
  }

  if (!channel) {
    return <div>No channel data available.</div>;
  }

  return (
    <div className="channel-info">
      {channel.isDM ? (
        <DM channel={channel} token={token} />
      ) : (
        <Channel
          channel={channel}
          friends={friends}
          socket={socket}
          token={token}
        />
      )}
    </div>
  );
};

const ChatInfo = ({ channelID, friends, setFriends, socket, token }: ChatInfoProps) => {
  return (
    <div className="chat-info-container">
      {channelID === null ? (
        <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
      ) : (
        <ChannelInfo
          channelID={channelID}
          friends={friends}
          socket={socket}
          token={token}
        />
      )}
    </div>
  );
};

export default ChatInfo;
