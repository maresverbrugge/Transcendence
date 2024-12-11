import React, { useState, useEffect } from 'react';
import './Messenger.css';
import { ChannelData, MessageData } from '../interfaces';
import axios from 'axios';


interface MessengerProps {
    channel: ChannelData | null;
    socket: any;
    token: string;
}

const Messenger = ({ channel, socket, token }: MessengerProps) => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    useEffect(() => {

        const fetchMessages = async () => {
            try {
                const response = await axios.get<MessageData[]>(`http://localhost:3001/chat/message/channel/${channel?.ID}/${token}`);
                setMessages(response.data)
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }

        if (channel) {
            fetchMessages();
        }

        const fetchMessage = async (messageID: number) => {
            try {
                const response = await axios.get<MessageData>(`http://localhost:3001/chat/message/${messageID}/${token}`)
                const newMessage = response.data;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
              } catch (error) {
                console.error('Error fetching message:', error);
              }
        }

        socket.on('newMessage', ({ messageID }: { messageID: number }) => fetchMessage(messageID))

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
