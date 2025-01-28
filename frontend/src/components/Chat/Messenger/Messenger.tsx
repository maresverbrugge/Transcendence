import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import './Messenger.css';
import axios from 'axios';
import { emitter } from '../../emitter';

import { MessageData } from '../interfaces';

interface MessengerProps {
  channelID: number | null;
  socket: Socket;
}

const Messenger = ({ channelID, socket }: MessengerProps) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const token = localStorage.getItem('authenticationToken');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<MessageData[]>(
          `${process.env.REACT_APP_URL_BACKEND}/chat/message/channel/${channelID}/${token}`
        );
        setMessages(response.data);
      } catch (error) {
        emitter.emit('error', error);
    }
    };

    if (channelID) {
      fetchMessages();
    }

    const fetchMessage = async (messageID: number) => {
      try {
        const response = await axios.get<MessageData>(`${process.env.REACT_APP_URL_BACKEND}/chat/message/${messageID}/${token}`);
        const newMessage = response.data;
  
        setMessages((prevMessages) => {
          if (prevMessages.some((message) => message.ID === newMessage.ID)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      } catch (error) {
        emitter.emit('error', error);
      }
    };

    socket.on('newMessage', ({ messageID }: { messageID: number }) => {
      setMessages((prevMessages) => {
        if (prevMessages.length === 0 || prevMessages[prevMessages.length - 1].ID !== messageID) {
          fetchMessage(messageID);
        }
        return prevMessages;
      });
    });
    
    socket.on('reloadMessages', fetchMessages)

    return () => {
      socket.off('newMessage');
      socket.off('reloadMessages')
    };
  }, [channelID, socket]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendMessage', { channelID, token, content: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div className="messenger-container">
      {!channelID ? (
        <div className="select-channel-message">Select a channel to start chatting!</div>
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
