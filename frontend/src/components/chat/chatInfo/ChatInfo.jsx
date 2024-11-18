import React from 'react';
import Friends from './Friends';
import ChannelInfo from './ChannelInfo';
import './ChatInfo.css';

const ChatInfo = ({ channel, setChannel, friends, setFriends, socket, token }) => {

    return (
        <div className="chat-info">
            {channel === null
                ? <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
                : <ChannelInfo channel={channel} setChannel={setChannel} token={token} socket={socket} />}
        </div>
    );
};

export default ChatInfo;
