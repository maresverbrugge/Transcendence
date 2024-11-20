import React, { useState, useEffect } from 'react';
import AlertMessage from '../../AlertMessage';
import ChannelMemberList from './ChannelMemberList'; // Import the new ChannelMemberList component

const Channel = ({ channel, setChannel, socket, token }) => {
    const [showMutedAlert, setShowMutedAlert] = useState(false);

    useEffect(() => {

        socket.emit('selectChannel', {channelID: channel.id, token }); //token later uit storage halen

        return () => {
            socket.emit('deselectChannel', {channelID: channel.id, token });
        };
    }, [channel]);


    const handleCloseMutedAlert = () => setShowMutedAlert(false);

    const removeChannel = () => {
        socket.emit('removeChannel', {channelID: channel.id, token})
        setChannel(null)
    }

    return (
        <div className="channel-container">
            {showMutedAlert && (<AlertMessage message="You are muted in this channel." onClose={handleCloseMutedAlert} />)}

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
