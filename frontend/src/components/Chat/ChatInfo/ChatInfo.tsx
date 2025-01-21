import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

import Friends from './Friends';
import { ChannelData, FriendData } from '../interfaces';
import Channel from './Channel';
import DM from './DM';
import axios from 'axios';
import { emitter } from '../../emitter';


interface ChannelInfoProps {
  channelID: number;
  friends: FriendData[];
  socket: Socket;
}

interface ChatInfoProps {
  channelID: number | null;
  friends: FriendData[];
  socket: Socket;
}

const ChannelInfo = ({ channelID, friends, socket }: ChannelInfoProps) => {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authenticationToken');
        const response = await axios.get<ChannelData>(`${process.env.REACT_APP_URL_BACKEND}/chat/channel/${channelID}/${token}`);
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
        <DM
          channelID={channel.ID}
          socket={socket}
        />
      ) : (
        <Channel
          channel={channel}
          friends={friends}
          socket={socket}
        />
      )}
    </div>
  );
};

const ChatInfo = ({ channelID, friends, socket }: ChatInfoProps) => {
  return (

    <div className="col-md-3 card shadow h-100" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-body p-0 pt-3 pb-3" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {channelID === null ? (
              <Friends friends={friends} socket={socket} />
            ) : (
              <ChannelInfo
                channelID={channelID}
                friends={friends}
                socket={socket}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
