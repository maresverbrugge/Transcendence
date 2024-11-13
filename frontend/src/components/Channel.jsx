import React, { useState, useEffect } from 'react';
import './Channel.css';
import AlertMessage from './AlertMessage';
import ChannelMemberList from './ChannelMemberList'; // Import the new ChannelMemberList component

const Channel = ({ channel, socket, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showMutedAlert, setShowMutedAlert] = useState(false);

    useEffect(() => {

        socket.on('newMessage', (message) => {
            if (message?.channelID === channel.channelID)
                setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('youAreMuted', () => {
            setShowMutedAlert(true);
        });

        socket.emit('joinRoom', {channelID: channel.id, token }); //token later uit storage halen

        return () => {
            socket.off('newMessage');
            socket.off('youAreMuted');
            socket.emit('leaveRoom', {channelID: channel.id, token });
        };
    }, [channel]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel.id, ownerToken: token, content: newMessage });
            setNewMessage('');
        }
    };

    const handleCloseMutedAlert = () => setShowMutedAlert(false);

    return (
        <div className="channel-container">
            {showMutedAlert && (<AlertMessage message="You are muted in this channel." onClose={handleCloseMutedAlert} />)}

            <div className="channel-header">
                <h2>Channel: {channel.name}</h2>
                <ChannelMemberList
                    channel={channel}
                    token={token}
                    socket={socket}
                />
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

export default Channel;
