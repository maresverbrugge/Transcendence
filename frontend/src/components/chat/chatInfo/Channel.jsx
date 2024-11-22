import React, { useState, useEffect } from 'react';
import AlertMessage from '../../AlertMessage';
import ChannelMemberList from './ChannelMemberList'; // Import the new ChannelMemberList component

const Channel = ({ channel, setChannel, socket, token }) => {

    useEffect(() => {

        socket.emit('selectChannel', {channelID: channel.id, token }); //token later uit storage halen

        return () => {
            socket.emit('deselectChannel', {channelID: channel.id, token });
        };
    }, [channel]);



    const removeChannel = () => {
        socket.emit('removeChannel', {channelID: channel.id, token})
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
            {channel.isPrivate && (<button onClick={removeChannel}>Leave Channel</button>)}
        </div>
    );
};

export default Channel;
