import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { emitter } from '../emitter';
import Accept from '../Accept';

interface ReceiveGameInviteProps {
    socket: Socket;
    token: string;
  }

const ReceiveGameInvite = ({socket, token}: ReceiveGameInviteProps) => {
  const [invite, setInvite] = useState<{senderUsername: string , senderUserID: number} | null>(null);
  const inviteRef = useRef<{ senderUsername: string; senderUserID: number } | null>(null);
  const navigate = useNavigate();

  const handleGameCreated = (created: boolean) => {
    if (created) {
      navigate('/game');
    } else {
      emitter.emit('alert', 'An error occurred while starting the game. Please try again.')
    }
  }

  useEffect(() => {

    socket.on('gameInvite', (data: {senderUsername: string , senderUserID: number}) => {
      if (!inviteRef.current) {
        setInvite(data);
        inviteRef.current = data;
      } else {
        socket.emit('declineGameInvite', {
          senderUserID: data.senderUserID,
          message: 'The player you invited for a game of Pong is currently busy with another invitation. Please try again later!',
          token
        })
      }
    })

    socket.on('cancelGameInvite', (data: {senderUserID: number}) => {
      if (
        inviteRef.current &&
        inviteRef.current.senderUserID === data.senderUserID
      ) {
        setInvite(null);
        inviteRef.current = null;
        emitter.emit('alert', 'The other player has cancelled the game invitation.');
      }
    });

    socket.on('gameCreated', handleGameCreated);

    return () => {
      socket.off('gameInvite');
      socket.off('cancelGameInvite');
    };
  }, []);

  useEffect(() => {
    inviteRef.current = invite;
  }, [invite]);

  const handleAcceptGameInvite = (senderUserID: number) => {
    setInvite(null);
    inviteRef.current = null;
    emitter.emit('acceptGameInvite');
    socket.emit('acceptGameInvite', {senderUserID, token});
    emitter.emit('alert', 'waiting for the game to start...')
  }

  const handleDeclineGameInvite = (senderUserID: number) => {
    socket.emit('declineGameInvite', {senderUserID, message: 'The other player has declined your game invitation.', token})
    setInvite(null);
  }

  return (
    <div>
      {invite && (
        <Accept
          message={`${invite.senderUsername} has invited you for a game of Pong!`}
          senderUserID={invite.senderUserID}
          onAccept={() => handleAcceptGameInvite(invite.senderUserID)}
          onDecline={() => handleDeclineGameInvite(invite.senderUserID)}
        />
      )}
    </div>
  );
};

export default ReceiveGameInvite;
