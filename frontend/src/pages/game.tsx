import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import PaddleSelect from '../components/Game/PaddleSelect';
import { emitter } from '../components/emitter';

const Game = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = localStorage.getItem('authenticationToken');
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [joinedGame, setJoinedGame] = useState<boolean>(false);

  useEffect(() => {

    const socketIo: Socket = io(`${process.env.REACT_APP_URL_BACKEND_WS}/matchmaking`, {
      transports: ["websocket"],
      query: { token },
	  withCredentials: true,
    });

    socketIo.on('newGame', () => {
      setJoinedGame(true);
    });

	socketIo.on('error', (error) => {emitter.emit('error', error)});

    setSocket(socketIo);

    return () => {
      socketIo.off('newGame');
      socketIo.off('error');
      socketIo.disconnect();
    };
  }, []);

  const joinQueue = (token) => {
	socket.emit('joinqueue', token);
	setInQueue(true);
  };

  const leaveQueue = (token) => {
	socket.emit('leavequeue', token);
	setInQueue(false);
  };

  if (!socket) {
    return;
  }

  return (
	<div className="d-flex justify-content-center align-items-center vh-100" style={{ overflowY: 'hidden' }}>
	  {joinedGame && <PaddleSelect />}
	  {!joinedGame && (
	    <div className="games-startup text-center">
	      <div className="d-flex flex-column gap-3 align-items-center">
	        {inQueue ? (
	          <button className="btn btn-primary" onClick={() => leaveQueue(token)}>
	            I don't want to play anymore
	          </button>
	        ) : (
	          <button className="btn btn-primary" onClick={() => joinQueue(token)}>
	            Wanna play?
	          </button>
	        )}
	        <label className="text-light">Join the queue to play.</label>
	      </div>
	    </div>
	  )}
	</div>
  );
};

export default Game;
