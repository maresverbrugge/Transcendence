import React from 'react';
import Friends from './Friends.tsx';
import './ChatInfo.css';
import { ChannelData, MemberData } from '../interfaces.tsx' 
import Channel from './Channel.tsx';

interface ChannelInfoProps {
    channel: ChannelData | null;
    setChannel: (channel: ChannelData | null) => void;
    token: string;
    socket: any; // Adjust this type if using a specific Socket.IO client library type
  }
  
  interface ChatInfoProps {
    channel: ChannelData | null;
    setChannel: (channel: ChannelData | null) => void;
    friends: MemberData[];
    setFriends: (friends: MemberData[]) => void;
    socket: any; // Adjust this type if using a specific Socket.IO client library type
    token: string;
  }
  

const ChannelInfo = ({ channel, setChannel, token, socket }: ChannelInfoProps) => {
    return (
        <div className="channel-info">
            {/* {channel.isDM ? <DMInfo /> : <Channel channel={selectedChannel} setChannel={setSelectedChannel} socket={socket} token={token}/>} LATER DMINFO TOEVOEGEN */}
            <Channel channel={channel} setChannel={setChannel} socket={socket} token={token} />
        </div>
    );
};

const ChatInfo = ({ channel, setChannel, friends, setFriends, socket, token }: ChatInfoProps) => {
    return (
        <div className="chat-info-container">
            {channel === null
                ? <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
                : <ChannelInfo channel={channel} setChannel={setChannel} token={token} socket={socket} />}
        </div>
    );
};

export default ChatInfo;
