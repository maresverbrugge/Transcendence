import React, { useState, useEffect } from 'react';
import './Messenger.css';

const Messenger = ({ channel, socket, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {

        socket.on('newMessage', (message) => {
            if (message?.channelID === channel.channelID)
                setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('youAreMuted', () => {
            setShowMutedAlert(true);
        });


        return () => {
            socket.off('newMessage');
            socket.off('youAreMuted');
        };
    }, [channel]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel.id, token: token, content: newMessage });
            setNewMessage('');
        }
    };

    return (
        <div className="messenger-container">
            {!channel ? (
                <div className="select-channel-message">
                    Select a channel to start chatting!
                </div>
            ) : (
                <>
                    <div className="message-list">
                        <ul>
                            {messages.map((message) => (
                                <li key={message.id}>
                                    <strong>{message.senderName}: </strong>
                                    {message.content}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="messenger-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </>
            )}
        </div>
    );
    
};

export default Messenger;
