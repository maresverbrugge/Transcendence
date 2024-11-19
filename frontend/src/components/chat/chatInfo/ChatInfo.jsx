import React from 'react';
import Friends from './Friends';
import './ChatInfo.css';
import Channel from './Channel';

const ChannelInfo = ({ channel, setChannel, token, socket }) => {

    return (
        <div className="channel-info">
            {/* {channel.isDM ? <DMInfo /> : <Channel channel={selectedChannel} setChannel={setSelectedChannel} socket={socket} token={token}/>} LATER DMINFO TOEVOEGEN */}
            {<Channel channel={channel} setChannel={setChannel} socket={socket} token={token}/>}
        </div>
    );
};

const ChatInfo = ({ channel, setChannel, friends, setFriends, socket, token }) => {

    return (
        <div className="chat-info-container">
            {channel === null
                ? <Friends friends={friends} setFriends={setFriends} socket={socket} token={token} />
                : <ChannelInfo channel={channel} setChannel={setChannel} token={token} socket={socket} />}
        </div>
    );
};

export default ChatInfo;
