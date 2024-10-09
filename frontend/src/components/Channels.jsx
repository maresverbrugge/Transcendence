import React, { useState, useEffect } from 'react';

const Channel = ({ channel, socket }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    console.log('channel', channel)
    useEffect(() => {

        setMessages(channel.messages || []);
        setMembers(channel.members || []);

        // Handle new messages
        socket.on('newMessage', (message) => {
            if (message) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        // Cleanup socket listeners when component unmounts
        return () => {
            socket.emit('leaveChannel', channel.id);
            socket.off('newMessage');
        };
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelId: channel.id, content: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="channel-container">
            <div className="channel-header">
                <h2>Channel: {channel.id}</h2>
                <h3>Members</h3>
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
                            <strong>{message.username}: </strong>
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
        socket.on('newChannel', (channel) => {
            socket.emit('joinChannel', channel.id)
            setChannels((prevChannels) => prevChannels.concat(channel))
		})
        
        return () => {
            socket.emit('leaveChannel', channel.id);
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
