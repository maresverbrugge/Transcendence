import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './Channels.css'; // Import the CSS file
import AlertMessage from '../../AlertMessage';
import NewChannel from './NewChannel';
import NewDM from './NewDM';
import { ChannelData, MemberData } from '../interfaces';

interface ChannelsProps {
  selectedChannel: ChannelData | null;
  selectChannel: (channelID: number | null) => void;
  friends: MemberData[];
  socket: any; // Adjust this type if using a specific Socket.IO client library type
  token: string;
  setAlert: (message: string | null) => void;
}

const Channels = ({ selectedChannel, selectChannel, friends, socket, token, setAlert }: ChannelsProps) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [showBannedAlert, setShowBannedAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get<ChannelData[]>(`http://localhost:3001/chat/channel/${token}`);
        setChannels(response.data);
        if (selectedChannel && !response.data.some((channel) => channel.ID === selectedChannel.ID)) {
          selectChannel(null);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();

    socket.on('updateChannel', fetchChannels);

    setUnreadCounts((prevCounts) => {
      if (!selectedChannel) return prevCounts;
      return {
        ...prevCounts,
        [selectedChannel.ID]: 0,
      };
    });

    socket.on('newMessage', ({ channelID }: { channelID: number }) => {
      if (channelID !== selectedChannel?.ID) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [channelID]: (prevCounts[channelID] || 0) + 1,
        }));
      }
    });

    // Cleanup function
    return () => {
      socket.off('updateChannel', fetchChannels);
      socket.off('newMessage');
    };
  }, [selectedChannel, socket, token]);

  const handleCloseBannedAlert = () => setShowBannedAlert(null);

  const handleClickChannel = (channelID: number) => {
    if (channelID === selectedChannel?.ID) selectChannel(null);
    else selectChannel(channelID);
  };

  return (
    <div className="channels-container">
      {showBannedAlert && <AlertMessage message={showBannedAlert} onClose={handleCloseBannedAlert} />}

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
                    <button onClick={() => handleClickChannel(channel.ID)}>
                      {channel.name || `Channel ${channel.ID}`}
                      {unreadCounts[channel.ID] > 0 && ` (${unreadCounts[channel.ID]} unread messages)`}
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
                    <button onClick={() => handleClickChannel(channel.ID)}>
                      {channel.name || `Channel ${channel.ID}`}
                      {unreadCounts[channel.ID] > 0 && ` (${unreadCounts[channel.ID]} unread messages)`}
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}

        <NewChannel friends={friends} selectChannel={selectChannel} socket={socket} token={token} />
      </div>

      <div className="direct-messages">
        <h2>Direct Messages</h2>
        <ul>
          {channels
            .filter((channel) => channel.isDM)
            .map((channel) => (
              <li key={channel.ID}>
                <button onClick={() => handleClickChannel(channel.ID)}>
                  {channel.name || `Channel ${channel.ID}`}
                  {unreadCounts[channel.ID] > 0 && ` (${unreadCounts[channel.ID]} unread messages)`}
                </button>
              </li>
            ))}
        </ul>
        <NewDM friends={friends} selectChannel={selectChannel} socket={socket} token={token} setAlert={setAlert} />
      </div>
    </div>
  );
};

export default Channels;
