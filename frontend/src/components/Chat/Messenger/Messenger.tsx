import React, { useState, useEffect } from 'react';
import './Messenger.css';
import { ChannelData, MessageData } from '../interfaces';


interface MessengerProps {
    channel: ChannelData | null;
    socket: any;
    token: string;
}

const Messenger = ({ channel, socket, token }: MessengerProps) => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    useEffect(() => {
        const getActionMessageMap = (username: string) => {
            return {
                demote: `${username} is no longer an Admin.`,
                makeAdmin: `${username} is now an Admin.`,
                mute: `${username} is now muted for 60 seconds.`,
                kick: `${username} has been kicked from the channel.`,
                ban: `${username} is now banned from the channel.`,
                join: `${username} has joined the channel.`,
                leave: `${username} has left the channel.`,
            }
        };

        if (channel) {
            setMessages(channel.messages);
        }

        socket.on('newMessage', (message: MessageData) => {
            if (message?.channelID === channel?.ID) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off('newMessage');
        };
    }, [channel, socket]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel?.ID, token, content: newMessage });
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
                                <li key={message.ID}>
                                    {message.senderID && message.senderName ? (
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
