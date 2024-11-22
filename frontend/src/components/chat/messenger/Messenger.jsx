import React, { useState, useEffect } from 'react';
import './Messenger.css';

const Messenger = ({ channel, socket, token }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {

        const getActionMessageMap = (username) => {
            return {
                demote: `${username} is no longer an Admin.`,
                makeAdmin: `${username} is now an Admin.`,
                mute: `${username} is now muted for 60 seconds.`,
                kick: `${username} has been kicked from the channel.`,
                ban: `${username} is now banned from the channel.`,
                join: `${username} has joined the channel.`,
            }
        };

        if (channel)
            setMessages(channel.messages)

        socket.on('newMessage', (message) => {
            if (message?.channelID === channel.channelID)
                setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('action', (data) => {
            const actionMessageMap = getActionMessageMap(data.username);
            setMessages((prevMessages) => [...prevMessages, {content: actionMessageMap[data.action]}])
        })

        return () => {
            socket.off('newMessage');
            socket.off('youAreMuted');
            socket.off('action');
        };
    }, [channel]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

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
                            {messages?.map((message) => (
                                <li key={message.id}>
                                    {message.senderName ? (
                                        <>
                                            <strong>{message.senderName}: </strong>
                                            {message.content}
                                        </>
                                    ) : (
                                        <em>{message.content}</em>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="messenger-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
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
