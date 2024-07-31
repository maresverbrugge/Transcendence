import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketIo = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    // Set socket instance in state
    setSocket(socketIo);

    // Handle incoming messages
    socketIo.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (username.trim() && input.trim()) {
      socket.emit('message', { sender: username, message: input });
      setInput(''); // Clear input after sending
    } else {
      alert('Please enter both a username and a message.');
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
      />
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
  );
};

export default ChatApp;
