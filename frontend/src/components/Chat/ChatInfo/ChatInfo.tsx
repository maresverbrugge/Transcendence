import React from 'react';
import Friends from './Friends.tsx';
import './ChatInfo.css';
import { ChannelData, MemberData } from '../interfaces.tsx' 
import Channel from './Channel.tsx';
import DM from './DM.tsx';

interface ChannelInfoProps {
    channel: ChannelData;
    handleSelectChannel: (channel: number | null) => void;
    friends: MemberData[]
    setAlert: (message: string) => void;
    token: string;
    socket: any; // Adjust this type if using a specific Socket.IO client library type
  }
  
  interface ChatInfoProps {
    channel: ChannelData | null;
    handleSelectChannel: (channel: number | null) => void;
    friends: MemberData[];
    setFriends: (friends: MemberData[]) => void;
    setAlert: (message: string) => void;
    socket: any; // Adjust this type if using a specific Socket.IO client library type
    token: string;
  }
  

const ChannelInfo = ({ channel, handleSelectChannel, friends, setAlert, token, socket }: ChannelInfoProps) => {
    return (
        <div className="channel-info">
            {channel.isDM ? <DM channel={channel} token={token} /> : <Channel channel={channel} handleSelectChannel={handleSelectChannel} friends={friends} setAlert={setAlert} socket={socket} token={token} />}
        </div>
    );
};

const ChatInfo = ({ channel, handleSelectChannel, friends, setFriends, setAlert, socket, token }: ChatInfoProps) => {
    return (
        <div className="chat-info-container">
            {channel === null
                ? <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
                : <ChannelInfo channel={channel} handleSelectChannel={handleSelectChannel} friends={friends} setAlert={setAlert} token={token} socket={socket} />}
        </div>
    );
};

export default ChatInfo;
