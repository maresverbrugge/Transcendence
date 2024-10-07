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
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Cleanup socket listeners when component unmounts
        return () => {
            socket.emit('leaveChannel', channel.id);
            socket.off('newMessage');
        };
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // Emit new message to the backend
            socket.emit('sendMessage', { channelId: channel.id, content: newMessage });

            // Clear the input field
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
                            {console.log('member', member)}
                            {console.log('user', member.user)}
                            {console.log('member.member', member.member)}
                            {member.user.username} {member.isAdmin && '(Admin)'}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="channel-messages">
                <ul>
                    {messages.map((message) => (
                        <li key={message.id}>
                            <strong>{message.sender.username}: </strong>
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

const Channels = ({ channels, socket }) => {
    const [selectedChannel, setSelectedChannel] = useState(null); // Track the selected channel

    const handleSelectChannel = (channel) => {
        setSelectedChannel(channel); // Update the selected channel
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
