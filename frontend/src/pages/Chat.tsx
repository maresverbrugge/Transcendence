import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import Channels from '../components/Chat/Channels/Channels';
import ChatInfo from '../components/Chat/ChatInfo/ChatInfo';
import Messenger from '../components/Chat/Messenger/Messenger';
import { FriendData } from '../components/Chat/interfaces';
import axios from 'axios';
import { emitter } from '../components/emitter';
import ReceiveGameInvite from '../components/Chat/ChatInfo/ReceiveGameInvite';
import GoBackButton from '../components/GoBackButton';
import NewChannel from '../components/Chat/Channels/NewChannel';
import PasswordPrompt from '../components/Chat/Channels/PasswordPrompt';

const Chat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channelID, setChannelID] = useState<number | null>(null);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const token = localStorage.getItem('authenticationToken');

  useEffect(() => {


      
    const socketIo = io(`${process.env.REACT_APP_URL_BACKEND_WS}/chat`, {
      transports: ["websocket"],
      query: { token },
      withCredentials: true,
    });
    
    socketIo.on('connect', () => {
      console.log('Connected to the server.');
    });

    socketIo.on('connect_error', (error: any) => {
      console.error('Connection Error:', error.message);
    });

    socketIo.on('error', (error) => {emitter.emit('error', error)});

    socketIo.on('deselectChannel', () => {
      selectChannel(null)
    })

    emitter.on('selectChannel', selectChannel);

    setSocket(socketIo);

    return () => {
      emitter.off('selectChannel');
      socketIo.disconnect();
    };
  }, []);

  const selectChannel = async (newChannelID: number | null) => {
    if (newChannelID === null) {
      setChannelID(null);
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_URL_BACKEND}/chat/channel/${newChannelID}/add-member`, { token: token} )
      setChannelID(newChannelID);
    } catch (error) {
      emitter.emit('error', error);
    }
  };

  if (!socket) return <p>Loading...</p>;

  return (
    <div className="container pt-5">
      {/* Overlays */}
      <NewChannel friends={friends} socket={socket}/>
      <GoBackButton />
      <ReceiveGameInvite socket={socket}/>
      <PasswordPrompt/>

      <div className="row g-4" style={{ height: '87%' }}>
        <Channels selectedChannelID={channelID} socket={socket}/>
        <Messenger channelID={channelID} socket={socket}/>
        <ChatInfo channelID={channelID} friends={friends} setFriends={setFriends} socket={socket}/>
      </div>
    </div>
  );  
};

export default Chat;
