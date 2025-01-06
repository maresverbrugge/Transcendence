import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SendGameInvite.css'
import GameInvitePopup from './GameInvitePopup';
import { emitter } from '../emitter';

interface SendGameInviteProps {
    receiverUserID: number;
    socket: Socket;
}

const SendGameInvite = ({ receiverUserID, socket }: SendGameInviteProps) => {
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authenticationToken');

  const handleSendGameInvite = () => {
    socket.emit('sendGameInvite', { receiverUserID, token });
    setIsPending(true);
    isPendingRef.current = true;
  };

  const handleCancelInvite = () => {
    socket.emit('cancelGameInvite', { receiverUserID, token });
    setIsPending(false);
    isPendingRef.current = false;
  };

  const handleAcceptResponse = async () => {
    emitter.emit('alert', 'The other player has accepted your game invitation.')
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL_BACKEND}/game/creategame/${token}/${receiverUserID}`, {});
      if (response.status === 201) {
        socket.emit('gameCreated', {receiverUserID, created: true, token});
        navigate('/game');
      } else {
        socket.emit('gameCreated', {receiverUserID, created: false, token});
        emitter.emit('alert', 'Failed to create the game, please try again');
      }
    } catch (error) {
      emitter.emit('error', error);
    }
  };

  useEffect(() => {
    const handleInviteResponse = (data: { accepted: boolean; message: string, receiverUserID: number }) => {
      if (data.receiverUserID === receiverUserID) {
        setIsPending(false);
        isPendingRef.current = false;
        if (data.accepted) {
          handleAcceptResponse();
        } else {
            emitter.emit('alert', data.message)
        }
      }
    };

    const handleAcceptGameInvite = () => {
      if (isPendingRef.current)
        handleCancelInvite();
    }

    emitter.on('acceptGameInvite', handleAcceptGameInvite);

    socket.on('gameInviteResponse', handleInviteResponse);

    return () => {
      emitter.off('acceptGameInvite')
      socket.off('gameInviteResponse', handleInviteResponse);
    };
  }, [socket, receiverUserID]);

  return (
    <div>
      <button onClick={handleSendGameInvite} disabled={isPending}>
        {isPending ? 'Invite Pending...' : 'Send Game Invite'}
      </button>

      {isPending && (
        <GameInvitePopup
          onCancel={handleCancelInvite}
        />
      )}
    </div>
  );
};

export default SendGameInvite;
