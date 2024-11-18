import React, { useState, useEffect } from 'react';

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
            socket.emit('sendMessage', { channelID: channel.id, ownerToken: token, content: newMessage });
            setNewMessage('');
        }
    };

    if (!channel)
        return "select a channel to start chatting!"

    return (
        <div className="messenger">
            <div className="messenger-messages">
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
        </div>
    );
};

export default Messenger;
