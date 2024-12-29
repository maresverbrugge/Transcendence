// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import PaddleSelect from '../components/Game/PaddleSelect';

const Game = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null); //tijdelijke oplossing voor Token
  const [joinedGame, setJoinedGame] = useState<bool>(false);

  useEffect(() => {
    //because dev mode sometimes didnt disconnect old sockets
    if (socket) {
      socket.disconnect(); // Disconnect existing socket if any
      console.log('Previous socket disconnected');
    }

    // Initialize socket connection
    const token: string = localStorage.getItem('token');
    const socketIo: Socket = io('http://localhost:3001/matchmaking', {
      transports: ['websocket', 'polling'],
      query: { token: token }, // Hier de token uit localstorage halen
    });

    //temporary replacing token for websocketID for testing
    socketIo.on('token', (websocketID: string) => {
      setTempToken(websocketID);
      console.log('replaced token with websocketID');
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

  const async joinQueue = (socket: Socket) => {
    socket.emit('joinqueue', token);
  };

  const async leaveQueue = (socket: Socket) => {
    socket.emit('leavequeue', token);
  };

  if (!socket) {
    return;
  }

  return (
    <div className="games-startup">
	  <div className="games-list">
		<button onClick={() => joinQueue(socket)}>{`Wanna play?`}</button>
		<button onClick={() => leaveQueue(socket)}>{`I don't want to play anymore`}</button>
      </div>

      {/* Display assigned game */}
      <div className="game-details">
        {joinedGame ? <PaddleSelect socket={socket} /> : <p>Join the queue to play.</p>}
      </div>
    </div>
  );
};

export default Game;
