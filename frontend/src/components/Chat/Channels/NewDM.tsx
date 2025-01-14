import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { emitter } from '../../emitter';

import { MemberData } from '../interfaces';
import './NewChannel.css';

interface NewDMProps {
  friends: MemberData[];
  socket: Socket;
}

const NewDM = ({ friends, socket }: NewDMProps) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<MemberData | null>(null);
  const token = localStorage.getItem('authenticationToken');

  const handleCreateDM = async () => {
    if (!selectedFriend) {
      emitter.emit('alert', 'Please select a friend to start a DM!');
      return;
    }

    try {
        const newChannelData = {
          name: '',
          isPrivate: true,
          isDM: true,
          password: null,
          token,
          memberIDs: [selectedFriend.ID],
        };
        const response = await axios.post(`${process.env.REACT_APP_URL_BACKEND}/chat/channel`, { newChannelData });
        socket.emit('newChannel', response.data);
        resetForm();
        emitter.emit('selectChannel', response.data.ID);
    } catch (error) {
        emitter.emit('error', error);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setSelectedFriend(null);
  };

  return (
    <>
      <button className="new-dm-button" onClick={() => setIsCreating(true)}>
        Create New DM
      </button>

      {isCreating && (
        <div className="new-channel-overlay">
          <div className="new-channel-form">
            <h3>Select a Friend for the DM</h3>
            <div>
              {friends.map((friend) => (
                <label key={friend.ID}>
                  <input
                    type="radio"
                    name="friendSelection"
                    checked={selectedFriend?.ID === friend.ID}
                    onChange={() => setSelectedFriend(friend)}
                  />
                  {friend.username}
                </label>
              ))}
            </div>
            <button onClick={handleCreateDM}>Done</button>
            <button onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NewDM;
