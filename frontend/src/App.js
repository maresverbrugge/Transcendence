import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketIo = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    // Set socket instance in state
    setSocket(socketIo);

    // Handle incoming chatHistory
    socketIo.on('chatHistory', (chatHistory) => {
      setMessages(chatHistory.map((msg) => ({
        sender: msg.user.name,
        message: msg.content,
      })));
    });

    // Handle incoming messages
    socketIo.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
    } else {
      alert('Please enter a username.');
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', { sender: username, message: input });
      setInput(''); // Clear input after sending
    } else {
      alert('Please enter a message.');
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h1>Chat App</h1>
          <input
            type="text"
            placeholder="Enter your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>
                {msg.sender}: {msg.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h1>Login</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default ChatApp;