import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './Channels.css'; // Import the CSS file
import AlertMessage from '../../AlertMessage';
import NewChannel from './NewChannel';
import NewDM from './NewDM';
import { ChannelData, MemberData } from '../interfaces';
import { emitter } from '../emitter';

interface ChannelsProps {
  selectedChannelID: number | null;
  friends: MemberData[];
  socket: any; // Adjust this type if using a specific Socket.IO client library type
  token: string;
}

const Channels = ({ selectedChannelID, friends, socket, token }: ChannelsProps) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [showBannedAlert, setShowBannedAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get<ChannelData[]>(`http://localhost:3001/chat/channel/all/${token}`);
        setChannels(response.data);
        if (selectedChannelID && !response.data.some((channel) => channel.ID === selectedChannelID)) {
          emitter.emit('selectChannel', null)
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();

    socket.on('updateChannel', fetchChannels);

    setUnreadCounts((prevCounts) => {
      if (!selectedChannelID) return prevCounts;
      return {
        ...prevCounts,
        [selectedChannelID]: 0,
      };
    });

    socket.on('newMessage', ({ channelID }: { channelID: number }) => {
      if (channelID !== selectedChannelID) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [channelID]: (prevCounts[channelID] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off('updateChannel', fetchChannels);
      socket.off('newMessage');
    };
  }, [selectedChannelID, socket]);

  const handleCloseBannedAlert = () => setShowBannedAlert(null);

  const handleClickChannel = (channelID: number) => {
    if (channelID === selectedChannelID) emitter.emit('selectChannel', null)
    else emitter.emit('selectChannel', channelID)
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

        <NewChannel friends={friends}socket={socket} token={token} />
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
        <NewDM friends={friends} socket={socket} token={token} />
      </div>
    </div>
  );
};

export default Channels;
