import React, { useState, useEffect } from 'react';
import AlertMessage from '../../AlertMessage';
import ChannelMemberList from './ChannelMemberList'; // Import the new ChannelMemberList component

const Channel = ({ channel, setChannel, socket, token }) => {

    useEffect(() => {

        if (!channel.isPrivate)
            socket.emit('joinChannel', {channelID: channel.id, token }); //token later uit storage halen

        return () => {
            if (!channel.isPrivate)
                socket.emit('leaveChannel', {channelID: channel.id, token });
        };
    }, [channel]);



    const leaveChannel = () => {
        socket.emit('leaveChannel', {channelID: channel.id, token})
        setChannel(null)
    }

    return (
        <div className="channel-container">
            <div className="channel-header">
                <h2>Channel: {channel.name}</h2>
                <ChannelMemberList
                    channel={channel}
                    setChannel={setChannel}
                    token={token}
                    socket={socket}
                />
            </div>
            {channel.isPrivate && (<button onClick={leaveChannel}>Leave Channel</button>)}
        </div>
    );
};

export default Channel;
