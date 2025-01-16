import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import PasswordPrompt from './PasswordPrompt';

import { ChannelData, MemberData } from '../interfaces';
import { emitter } from '../../emitter';

interface ChannelsProps {
  selectedChannelID: number | null;
  socket: Socket;
}

interface ChannelListItemProps {
  channel: ChannelData;
  handleClickChannel: (channelID: number) => void;
  unreadCounts: number;
}

const ChannelListItem = ({ channel, handleClickChannel, unreadCounts}: ChannelListItemProps) => {
  return (
    <li key={channel.ID} className="list-group-item d-flex justify-content-between align-items-center">
      <button
        className="btn btn-link text-decoration-none p-0"
        onClick={() => handleClickChannel(channel.ID)}
      >
        {channel.name || `Channel ${channel.ID}`}
      </button>
      {unreadCounts > 0 && (
        <span className="badge bg-primary rounded-pill">{unreadCounts}</span>
      )}
    </li>
  )
}

const Channels = ({ selectedChannelID, socket }: ChannelsProps) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [passwordPromptVisible, setPasswordPromptVisible] = useState<boolean>(false);
  const [selectedChannelForPassword, setSelectedChannelForPassword] = useState<number | null>(null);
  const token = localStorage.getItem('authenticationToken');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get<ChannelData[]>(`${process.env.REACT_APP_URL_BACKEND}/chat/channel/all/${token}`);
        setChannels(response.data);
        if (selectedChannelID && !response.data.some((channel) => channel.ID === selectedChannelID)) {
          emitter.emit('selectChannel', null)
        }
      } catch (error) {
        emitter.emit('error', error);
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

  const handleClickChannel = (channelID: number) => {
    var channel = channels.find((ch) => ch.ID === channelID);
    if (channelID === selectedChannelID) channel = null;
    if (channel?.passwordEnabled) {
      setSelectedChannelForPassword(channelID);
      setPasswordPromptVisible(true);
    }
    else {
      emitter.emit('selectChannel', channel ? channel.ID : null);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL_BACKEND}/chat/channel/${selectedChannelForPassword}/verify-password`, { password })
      if (response.status ===  200) {
        emitter.emit('selectChannel', selectedChannelForPassword);
        setPasswordPromptVisible(false);
      } else {
        emitter.emit('alert', 'Incorrect password');
      }
    } catch (error) {
      emitter.emit('error', error);
    }
  };

  return (
    <div className="col-md-3">
      <div className="card shadow h-100">
        <div className="card-body p-2">
          <div className="d-flex flex-column h-100">

            {/* Top Section */}
            <div>
              <h2>Available Channels</h2>
            </div>
        
            {/* Public Channels */}
            <div className="flex-grow-1">
              {channels.some((channel) => !channel.isPrivate) && (
                <div className="mb-4">
                  <h3>Public Channels</h3>
                  <ul className="list-group">
                    {channels
                      .filter((channel) => !channel.isPrivate)
                      .map((channel) => (
                        <ChannelListItem channel={channel} handleClickChannel={handleClickChannel} unreadCounts={unreadCounts[channel.ID]} />
                      ))}
                  </ul>
                </div>
              )}

              {/* Private Channels */}
              {channels.some((channel) => channel.isPrivate && !channel.isDM) && (
                <div className="mb-4">
                  <h3>Private Channels</h3>
                  <ul className="list-group">
                    {channels
                      .filter((channel) => channel.isPrivate && !channel.isDM)
                      .map((channel) => (
                        <ChannelListItem channel={channel} handleClickChannel={handleClickChannel} unreadCounts={unreadCounts[channel.ID]} />
                      ))}
                  </ul>
                </div>
              )}
        
              {/* Direct Messages */}
              {channels.some((channel) => channel.isDM) && (
                <div className="mb-4">
                  <h3>Direct Messages</h3>
                  <ul className="list-group">
                    {channels
                      .filter((channel) => channel.isDM)
                      .map((channel) => (
                        <ChannelListItem channel={channel} handleClickChannel={handleClickChannel} unreadCounts={unreadCounts[channel.ID]} />
                      ))}
                  </ul>
                </div>
              )}
            </div>
        
            {/* Create New Channel Button */}
            <button type="button" className="btn btn-success" onClick={() => emitter.emit('createChannel')}>
              New Channel
            </button>
        
            {/* Password Prompt */}
            {passwordPromptVisible && (
              <PasswordPrompt onClose={() => setPasswordPromptVisible(false)} onSubmit={handlePasswordSubmit} />
            )}

          </div>
        </div>
      </div>
    </div>
  );  
};

export default Channels;
