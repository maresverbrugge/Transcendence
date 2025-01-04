// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import PaddleSelect from '../components/Game/PaddleSelect';

const Game = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(null); //tijdelijke oplossing voor Token
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [joinedGame, setJoinedGame] = useState<boolean>(false);

  useEffect(() => {
    //because dev mode sometimes didnt disconnect old sockets
    if (socket) {
      socket.disconnect(); // Disconnect existing socket if any
      console.log('Previous socket disconnected');
    }

    // Initialize socket connection
    const token: string = localStorage.getItem('authenticationToken');
	setToken(token);
    const socketIo: Socket = io('http://localhost:3001/matchmaking', {
      transports: ['websocket', 'polling'],
      query: { token }, // Hier de token uit localstorage halen
    });

    socketIo.on('newgame', () => {
      setJoinedGame(true);
    });

    // Set socket instance in state
    setSocket(socketIo);

    return () => {
      socketIo.off('newGame');
      socketIo.off('token');
      socketIo.disconnect(); // Disconnect the socket when the component unmounts
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
    <div className="games-startup">
		{inQueue && (
			<button onClick={() => leaveQueue(token)}>{`I don't want to play anymore`}</button>
		)}
		{!inQueue && (
			<button onClick={() => joinQueue(token)}>{`Wanna play?`}</button>
		)}

      {/* Display assigned game */}
      <div className="game-details">
        {joinedGame ? <PaddleSelect/> : <p>Join the queue to play.</p>}
      </div>
    </div>
  );
};

export default Game;
