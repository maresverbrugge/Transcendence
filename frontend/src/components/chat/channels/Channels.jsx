import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css'; // Import the CSS file
import AlertMessage from '../../AlertMessage';
import NewChannel from './NewChannel';
import NewDM from './NewDM';

const Channels = ({ selectedChannel, setSelectedChannel, friends, socket, token, setAlert }) => {
    const [channels, setChannels] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per channel
    const [showBannedAlert, setShowBannedAlert] = useState(null);


    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/${token}`);
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
            if (channelID !== selectedChannel?.id)
                setUnreadCounts((prevCounts) => ({
                    ...prevCounts,
                    [channelID]: (prevCounts[channelID] || 0) + 1,
                }));
        });

        return () => {
            socket.off('newChannel');
            socket.off('newMessageOnChannel');
        };
    }, [selectedChannel]);

    // const fetchCurrentUser = async (channelID, token) => {
    //     try {
    //         const response = await axios.get(`http://localhost:3001/chat/channel/member/${channelID}/${token}`);
    //         setcurrentUserChannelMember(response.data);
    //     }
    //     catch {
    //         setcurrentUserChannelMember(null)
    //     }
    // }

    const handleSelectChannel = async (channel) => {
        if (channel?.id === selectedChannel?.id) {
            setSelectedChannel(null)
            return
        }
        // fetchCurrentUser(channel.id, token);
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
            console.log('error:', error)
            if (error.response && error.response.status === 403)
                setShowBannedAlert(error.response.data.message);
            else
                console.error('Error fetching channel:', error);
            setSelectedChannel(null)
        }
    };

    const handleCloseBannedAlert = () => setShowBannedAlert(null);

    return (
        <div className="channels-container">
            {showBannedAlert && (
                <AlertMessage message={showBannedAlert} onClose={handleCloseBannedAlert} />
            )}
    
            {/* List of Channels */}
            <div className="channels-list">
                <h2>Available Channels</h2>
    
                {/* Public Channels */}
                {channels.some(channel => !channel.isPrivate) && (
                    <>
                        <h3>Public</h3>
                        <ul>
                            {channels
                                .filter(channel => !channel.isPrivate) // Only include non-private channels
                                .map(channel => (
                                    <li key={channel.id}>
                                        <button onClick={() => handleSelectChannel(channel)}>
                                            {channel.name || `Channel ${channel.id}`}
                                            {unreadCounts[channel.id] > 0 && ` (${unreadCounts[channel.id]} unread messages)`}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </>
                )}
    
                {/* Private Channels */}
                {channels.some(channel => channel.isPrivate && !channel.isDM) && (
                    <>
                        <h3>Private</h3>
                        <ul>
                            {channels
                                .filter(channel => channel.isPrivate && !channel.isDM) // Only include private, non-DM channels
                                .map(channel => (
                                    <li key={channel.id}>
                                        <button onClick={() => handleSelectChannel(channel)}>
                                            {channel.name || `Channel ${channel.id}`}
                                            {unreadCounts[channel.id] > 0 && ` (${unreadCounts[channel.id]} unread messages)`}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </>
                )}
    
                <NewChannel friends={friends} socket={socket} token={token} />
            </div>
    
            {/* Direct Messages */}
            <div className="direct-messages">
                <h2>Direct Messages</h2>
                <ul>
                    {channels
                        .filter(channel => channel.isDM)
                        .map(channel => (
                            <li key={channel.id}>
                                <button onClick={() => handleSelectChannel(channel)}>
                                    {channel.name || `Channel ${channel.id}`}
                                    {unreadCounts[channel.id] > 0 && ` (${unreadCounts[channel.id]} unread messages)`}
                                </button>
                            </li>
                        ))}
                </ul>
                <NewDM friends={friends} socket={socket} token={token} setAlert={setAlert} />
            </div>
        </div>
    );    
};

export default Channels