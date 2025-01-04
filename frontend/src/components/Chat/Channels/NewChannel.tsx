import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { emitter } from '../emitter';

import { MemberData } from '../interfaces';

interface NewChannelProps {
  friends: MemberData[];
  socket: Socket;
}

const NewChannel = ({ friends, socket }: NewChannelProps) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [selectedMemberIDs, setSelectedMemberIDs] = useState<number[]>([]);
  const token = localStorage.getItem('authenticationToken');

  const toggleMember = (userID: number) => {
    setSelectedMemberIDs((prev) => (prev.includes(userID) ? prev.filter((id) => id !== userID) : [...prev, userID]));
  };

  const handleCreateChannel = async () => {
    try {
        const newChannelData = {
          name: channelName,
          isPrivate,
          isDM: false,
          passwordEnabled,
          password: passwordEnabled ? password : null,
          token,
          memberIDs: isPrivate ? selectedMemberIDs : [],
        };
        const response = await axios.post('http://localhost:3001/chat/channel', { newChannelData });
        socket.emit('newChannel', response.data);
        resetForm();
        emitter.emit('selectChannel', response.data.ID)
    } catch (error) {
        emitter.emit('error', error);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setChannelName('');
    setIsPrivate(false);
    setPasswordEnabled(false);
    setPassword('');
    setSelectedMemberIDs([]);
  };

  return (
    <>
      <button className="new-channel-button" onClick={() => setIsCreating(true)}>
        Create New Channel
      </button>
      {isCreating && (
        <div className="new-channel-overlay">
          <div className="new-channel-form">
            <input
              type="text"
              placeholder="Channel Name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
            <div>
              <label>
                <input
                  type="radio"
                  name="channelType"
                  checked={!isPrivate}
                  onChange={() => {
                    setIsPrivate(false);
                    setPasswordEnabled(false);
                  }}
                />
                Public
              </label>
              <label>
                <input
                  type="radio"
                  name="channelType"
                  checked={isPrivate}
                  onChange={() => {
                    setIsPrivate(true);
                    setPasswordEnabled(false);
                    setPassword('');
                  }}
                />
                Private
              </label>
            </div>
            {isPrivate && (
              <div>
                <h4>Add Members:</h4>
                {friends.map((friend) => (
                  <label key={friend.ID}>
                    <input
                      type="checkbox"
                      checked={selectedMemberIDs.includes(friend.ID)}
                      onChange={() => toggleMember(friend.ID)}
                    />
                    {friend.username}
                  </label>
                ))}
              </div>
            )}
            {!isPrivate && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={passwordEnabled}
                    onChange={(e) => setPasswordEnabled(e.target.checked)}
                  />
                  Password
                </label>
                {passwordEnabled && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}
              </div>
            )}
            <button onClick={handleCreateChannel}>Done</button>
            <button onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChannel;