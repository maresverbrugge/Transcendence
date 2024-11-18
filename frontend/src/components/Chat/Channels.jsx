import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css'; // Import the CSS file

const Channel = ({ channel, socket, token }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    console.log('channel', channel)
    useEffect(() => {

        const fetchChannel = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channels/${channel.id}`);
                setMessages(response.data.messages);
                setMembers(response.data.members)
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        };
    
        fetchChannel();

        socket.on('newMessage', (message) => {
            if (message?.channelID == channel.channelID) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off('newMessage');
        };
    }, [channel]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel.id, ownerToken: token, content: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="channel-container">
            <div className="channel-header">
                <h2>Channel: {channel.name}</h2>
                <ul>
                    {members.map((member) => (
                        <li key={member.id}>
                            {member.user.username} {member.isAdmin && '(Admin)'}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="channel-messages">
                <ul>
                    {messages.map((message) => (
                        <li key={message.id}>
                            <strong>{message.senderName}: </strong>
                            {message.content}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="channel-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

const Channels = ({ socket, token }) => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per channel

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channels`);
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

        socket.on('newMessage', (message) => {
            // Update unread count if the message is for an unselected channel
            if (message?.channelID !== selectedChannel?.id) {
                setUnreadCounts((prevCounts) => ({
                    ...prevCounts,
                    [message.channelID]: (prevCounts[message.channelID] || 0) + 1,
                }));
            }
        });

        return () => {
            socket.off('newChannel');
            socket.off('newMessage');
        };
    }, [selectedChannel]);

    const handleSelectChannel = (channel) => {
        setSelectedChannel(channel);
        // Reset unread count for the selected channel
        setUnreadCounts((prevCounts) => ({
            ...prevCounts,
            [channel.id]: 0,
        }));
    };

    return (
        <div className="channels-container">
            {/* List of Channels */}
            <div className="channels-list">
                <h2>Available Channels</h2>
                <ul>
                    {channels.map((channel) => (
                        <li key={channel.id}>
                            <button onClick={() => handleSelectChannel(channel)}>
                                {channel.name || `Channel ${channel.id}`}
                                {unreadCounts[channel.id] > 0 && ` (${unreadCounts[channel.id]})`}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Display selected Channel */}
            <div className="channel-details">
                {selectedChannel ? (
                    <Channel channel={selectedChannel} socket={socket} token={token} />
                ) : (
                    <p>Select a channel to view its messages and members.</p>
                )}
            </div>
        </div>
    );
};

export default Channels