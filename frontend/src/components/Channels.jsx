import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css'; // Import the CSS file

const Channel = ({ channel, socket }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    console.log('channel', channel)
    useEffect(() => {

        setMessages(channel.messages || []);
        setMembers(channel.members || []);

        socket.on('newMessage', (message) => {
            if (message) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off('newMessage');
        };
    }, []);

    const handleSendMessage = () => {
        const senderID = 1; // HIER KOMT EEN Identifier op basis van de token?
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel.id, senderID: senderID, content: newMessage });
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

const Channels = ({ socket }) => {
    
    const [channels, setChannels] = useState([])
    const [selectedChannel, setSelectedChannel] = useState(null);
    
    useEffect(() => {

        // const userID = '1'; //userID ergens vandaan halen! misschien via localstorage acces token?
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channels`);
                setChannels(response.data);
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        };
    
        fetchChannels();

        socket.on('newChannel', (channel) => {
            setChannels((prevChannels) => prevChannels.concat(channel))
		})
        
        return () => {
            socket.emit('leaveChannel', selectedChannel.id);
            socket.off('newChannel');
        };
    }, []);
    
    const handleSelectChannel = (channel) => {
        setSelectedChannel(channel);
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
                                {channel.name || `Channel ${channel.id}`} {/* Display channel name or id */}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Display selected Channel */}
            <div className="channel-details">
                {selectedChannel ? (
                    <Channel channel={selectedChannel} socket={socket}/>
                ) : (
                    <p>Select a channel to view its messages and members.</p>
                )}
            </div>
        </div>
    );
};

export default Channels;
