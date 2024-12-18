import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Channels from '../components/Chat/Channels/Channels';
import AlertMessage from '../components/AlertMessage';
import ChatInfo from '../components/Chat/ChatInfo/ChatInfo';
import Messenger from '../components/Chat/Messenger/Messenger';
import { MemberData } from '../components/Chat/interfaces';
import axios from 'axios';
import './Chat.css'
import { emitter } from '../components/Chat/emitter';

const Chat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [channelID, setChannelID] = useState<number | null>(null);
  const [friends, setFriends] = useState<MemberData[]>([]);
  const [tempToken, setTempToken] = useState<string>(null);
  var tempWebSocketID = null;

  useEffect(() => {
  
    const token = localStorage.getItem('authenticationToken');
    const socketIo = io("ws://localhost:3001/chat", {
      transports: ["websocket"],
      query: { token },
      withCredentials: true,
    });

    socketIo.on('token', (websocketID: string) => {
      setTempToken(websocketID)
      tempWebSocketID = websocketID;
      console.log('replaced tempToken with webSocketID: ', websocketID);
    });

    socketIo.on('connect_error', (error: any) => {
      console.error('Connection Error:', error.message);
    });

    socketIo.on('error', showError);

    socketIo.on('deselectChannel', () => {
      selectChannel(null)
    })

    emitter.on('selectChannel', selectChannel);
    emitter.on('alert', setAlert),
    emitter.on('error', showError)

    setSocket(socketIo);

    return () => {
      emitter.off('selectChannel');
      emitter.off('error');
      emitter.off('alert');
      socketIo.disconnect();
    };
  }, []);

  const showError = (error: any) => {
    console.error(error);
    setAlert(error?.response?.data?.message || 'An error occurred')
  }

  const selectChannel = async (newChannelID: number | null) => {
    if (newChannelID === null) {
      setChannelID(null);
      return;
    }
    try {
      await axios.post(`http://localhost:3001/chat/channel/${newChannelID}/add-member`, { token: tempWebSocketID} )
      setChannelID(newChannelID);
    } catch (error: any) {
      if (error.response?.status === 403) {
        showError(error);
      } else {
        console.error('Error selecting channel', error);
      }
    }
  };

  if (!socket || !tempToken) return <p>Loading...</p>;

  return (
    <div>
      {alert && (
        <AlertMessage
          message={alert}
          onClose={() => setAlert(null)}
        />
      )}
      <Channels
        selectedChannelID={channelID}
        friends={friends}
        socket={socket}
        token={tempToken}
      />
      <Messenger channelID={channelID} socket={socket} token={tempToken} />
      <ChatInfo
        channelID={channelID}
        friends={friends}
        setFriends={setFriends}
        socket={socket}
        token={tempToken}
      />
    </div>
  );
};

export default Chat;
