import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css'; // Import the CSS file
import AlertMessage from '../../AlertMessage';
import NewChannel from './NewChannel';
import NewDM from './NewDM';
import { ChannelData, MemberData, MessageData } from '../interfaces'

interface ChannelsProps {
  selectedChannel: ChannelData | null;
  setSelectedChannel: (channel: ChannelData | null) => void;
  friends: MemberData[];
  socket: any; // Adjust this type if using a specific Socket.IO client library type
  token: string;
  setAlert: (message: string | null) => void;
}

const Channels = ({
  selectedChannel,
  setSelectedChannel,
  friends,
  socket,
  token,
  setAlert,
}: ChannelsProps) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showBannedAlert, setShowBannedAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get<ChannelData[]>(
          `http://localhost:3001/chat/channel/${token}`
        );
        setChannels(response.data);
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();

    // Listen for new channels and messages
    socket.on('newChannel', (channel: ChannelData) => {
      setChannels((prevChannels) => prevChannels.concat(channel));
    });

    socket.on('newMessage', (message: MessageData) => {
      if (message.channelID !== selectedChannel?.ID) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [message.channelID]: (prevCounts[message.channelID] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off('newChannel');
      socket.off('newMessage');
    };
  }, [selectedChannel, socket, token]);

  const handleSelectChannel = async (channel: ChannelData) => {
    if (channel?.ID === selectedChannel?.ID) {
      setSelectedChannel(null);
      return;
    }
    try {
      const response = await axios.get<ChannelData>(
        `http://localhost:3001/chat/channel/${channel.ID}/${token}`
      );
      setSelectedChannel(response.data);
      setUnreadCounts((prevCounts) => ({
        ...prevCounts,
        [channel.ID]: 0,
      }));
    } catch (error: any) {
      console.error('Error fetching channel:', error);
      if (error.response && error.response.status === 403) {
        setShowBannedAlert(error.response.data.message);
      } else {
        console.error('Error fetching channel:', error);
      }
      setSelectedChannel(null);
    }
  };

  const handleCloseBannedAlert = () => setShowBannedAlert(null);

  return (
    <div className="channels-container">
      {showBannedAlert && (
        <AlertMessage message={showBannedAlert} onClose={handleCloseBannedAlert} />
      )}

      <div className="channels-list">
        <h2>Available Channels</h2>

        {channels.some((channel) => !channel.isPrivate) && (
          <>
            <h3>Public</h3>
            <ul>
              {channels
                .filter((channel) => !channel.isPrivate)
                .map((channel) => (
                  <li key={channel.ID}>
                    <button onClick={() => handleSelectChannel(channel)}>
                      {channel.name || `Channel ${channel.ID}`}
                      {unreadCounts[channel.ID] > 0 &&
                        ` (${unreadCounts[channel.ID]} unread messages)`}
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}

        {channels.some((channel) => channel.isPrivate && !channel.isDM) && (
          <>
            <h3>Private</h3>
            <ul>
              {channels
                .filter((channel) => channel.isPrivate && !channel.isDM)
                .map((channel) => (
                  <li key={channel.ID}>
                    <button onClick={() => handleSelectChannel(channel)}>
                      {channel.name || `Channel ${channel.ID}`}
                      {unreadCounts[channel.ID] > 0 &&
                        ` (${unreadCounts[channel.ID]} unread messages)`}
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}

        <NewChannel friends={friends} socket={socket} token={token} />
      </div>

      <div className="direct-messages">
        <h2>Direct Messages</h2>
        <ul>
          {channels
            .filter((channel) => channel.isDM)
            .map((channel) => (
              <li key={channel.ID}>
                <button onClick={() => handleSelectChannel(channel)}>
                  {channel.name || `Channel ${channel.ID}`}
                  {unreadCounts[channel.ID] > 0 &&
                    ` (${unreadCounts[channel.ID]} unread messages)`}
                </button>
              </li>
            ))}
        </ul>
        <NewDM friends={friends} socket={socket} token={token} setAlert={setAlert} />
      </div>
    </div>
  );
};

export default Channels;
