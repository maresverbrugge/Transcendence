import React, { useState, useEffect } from 'react';
import { SocketIOClient } from 'socket.io-client';
import './Messenger.css';

interface Message {
    id: string;
    senderName?: string;
    content: string;
    channelID: string;
}

interface Channel {
    id: string;
    channelID: string;
    messages: Message[];
}

interface MessengerProps {
    channel: Channel | null;
    socket: SocketIOClient.Socket;
    token: string;
}

const Messenger = ({ channel, socket, token }: MessengerProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
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

        socket.on('newMessage', (message: Message) => {
            if (message?.channelID === channel?.channelID) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        socket.on('action', (data: { username: string, action: keyof ReturnType<typeof getActionMessageMap> }) => {
            const actionMessageMap = getActionMessageMap(data.username);
            setMessages((prevMessages) => [...prevMessages, { content: actionMessageMap[data.action], id: `${data.username}-${data.action}`, channelID: channel?.channelID || '' }]);
        });

        return () => {
            socket.off('newMessage');
            socket.off('action');
        };
    }, [channel, socket]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel?.id, token, content: newMessage });
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
