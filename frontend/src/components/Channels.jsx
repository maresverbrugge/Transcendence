import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css'; // Import the CSS file
import AlertMessage from './AlertMessage';
import Channel from './Channel';

const Channels = ({ socket, token }) => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per channel
    const [showBannedAlert, setShowBannedAlert] = useState(false);
    const [currentUserChannelMember, setcurrentUserChannelMember] = useState(null);


    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel`);
                setChannels(response.data);
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        };

        fetchChannels();

        // Listen for new channels and messages
        socket.on('newChannel', (channel) => {
            setChannels((prevChannels) => prevChannels.concat(channel));
        });

        socket.on('newMessageOnChannel', (channelID) => {
            // Update unread count if the message is for an unselected channel
            if (channelID !== selectedChannel?.id) {
                setUnreadCounts((prevCounts) => ({
                    ...prevCounts,
                    [channelID]: (prevCounts[channelID] || 0) + 1,
                }));
            }
        });

        return () => {
            socket.off('newChannel');
            socket.off('newMessageOnChannel');
        };
    }, [selectedChannel]);

    const handleSelectChannel = async (channel) => {
        const fetchcurrentUserChannelMember = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/member/${channel.id}/${token}`);
                setcurrentUserChannelMember(response.data);
            } catch (error) {
                console.error('Error fetching current user ChannelMember:', error);
            }
        };
        fetchcurrentUserChannelMember();
        try {
            const response = await axios.get(`http://localhost:3001/chat/channel/${channel.id}/${token}`);
            setSelectedChannel({
                ...channel,
                messages: response.data.messages,
                members: response.data.members,
            });
            // Reset unread count for the selected channel
            setUnreadCounts((prevCounts) => ({
                ...prevCounts,
                [channel.id]: 0,
            }));
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setShowBannedAlert(true);
            } else {
                console.error('Error fetching channel:', error);
            }
            setSelectedChannel(null)
        }
    };
    

    const handleCloseBannedAlert = () => setShowBannedAlert(false);

    return (
        <div className="channels-container">
            {showBannedAlert && (<AlertMessage message="You are banned from this channel." onClose={handleCloseBannedAlert} />)}
            {/* List of Channels */}
            <div className="channels-list">
                <h2>Available Channels</h2>
                <ul>
                    {channels.map((channel) => (
                        <li key={channel.id}>
                            <button onClick={() => handleSelectChannel(channel)}>
                                {channel.name || `Channel ${channel.id}`}
                                {unreadCounts[channel.id] > 0 && ` (${unreadCounts[channel.id]} unread messages)`}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Display selected Channel */}
            <div className="channel-details">
                {selectedChannel ? (
                    <Channel channel={selectedChannel} socket={socket} token={token} currentUserChannelMember={currentUserChannelMember} />
                ) : (
                    <p>Select a channel to view its messages and members.</p>
                )}
            </div>
        </div>
    );
};

export default Channels