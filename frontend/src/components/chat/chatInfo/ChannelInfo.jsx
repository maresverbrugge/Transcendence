import React from 'react';
import Channel from './Channel';

const ChannelInfo = ({ channel, setChannel, token, socket }) => {

    return (
        <div className="channel-info">
            {/* {channel.isDM ? <DMInfo /> : <Channel channel={selectedChannel} setChannel={setSelectedChannel} socket={socket} token={token}/>} LATER DMINFO TOEVOEGEN */}
            {<Channel channel={channel} setChannel={setChannel} socket={socket} token={token}/>}
        </div>
    );
};

export default ChannelInfo;
