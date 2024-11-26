import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Channels from '../components/Chat/Channels/Channels.tsx';
import AlertMessage from '../components/AlertMessage.tsx';
import ChatInfo from '../components/Chat/ChatInfo/ChatInfo.tsx';
import Messenger from '../components/Chat/Messenger/Messenger.tsx';
import { ChannelData, MemberData } from '../components/Chat/interfaces.tsx';
import './Chat.css'

const Chat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null); // Temporary token replacement
  const [alert, setAlert] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [friends, setFriends] = useState<MemberData[]>([]);

  useEffect(() => {
  
    // Initialize socket connection
    const token = localStorage.getItem('authenticationToken');
    const socketIo = io("ws://localhost:3001/chat", {
      transports: ["websocket"], // Ensure WebSocket transport is used
      query: { token },
      withCredentials: true, // Ensure credentials are included
    });

    // Temporary replacing token for websocketID for testing
    socketIo.on('token', (websocketID: string) => {
      setTempToken(websocketID);
      console.log('Replaced token with websocketID: ', websocketID);
    });

    socketIo.on('connect_error', (error) => {
      console.error('Connection Error:', error.message);
    });

    socketIo.on('error', (error: any) => {
      console.error(error);
      setAlert(error.response?.message || 'An error occurred');
    });

    // Set socket instance in state
    setSocket(socketIo);

    return () => {
      socketIo.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, []);

  if (!socket || !tempToken) return null;

  return (
    <div>
      {alert && (
        <AlertMessage
          message={alert}
          onClose={() => setAlert(null)}
        />
      )}
      <Channels
        selectedChannel={channel}
        setSelectedChannel={setChannel}
        friends={friends}
        socket={socket}
        token={tempToken}
        setAlert={setAlert}
      />
      <Messenger channel={channel} socket={socket} token={tempToken} />
      <ChatInfo
        channel={channel}
        setChannel={setChannel}
        friends={friends}
        setFriends={setFriends}
        socket={socket}
        token={tempToken}
      />
    </div>
  );
};

export default Chat;
