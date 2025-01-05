// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

import GameControl from './GameControl';

const PaddleSelect = ({}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPaddle, setSelectedPaddle] = useState<string>("default");
  const [gameID, setGameID] = useState<number>(-1);
  const [showGame, setShowGame] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
    const socketIo: Socket = io('{process.env.REACT_APP_URL_BACKEND}/game', {
      transports: ['websocket'],
      query: { token }, // Hier de token uit localstorage halen
    });

	socketIo.on('connect_error', (error) => {
		console.error('Connection Error:', error.message);
	  });

    // Set socket instance in state
    setSocket(socketIo);
    socketIo.emit('getGameID', token);
    socketIo.on('gameID', (gameID: number) => {
      setGameID(gameID);
    });

    return () => {
      socketIo.off('token');
      socketIo.off('getGameID');
	  socketIo.disconnect(); // Disconnect the socket when the component unmounts
  };
  }, []);

  function handleChange(event) {
    setSelectedPaddle(event.target.value);
	setShowGame(true);
  }

  return (
	<div>
		{showGame && (
			<GameControl gameID={gameID} socket={socket} skin={selectedPaddle} />
		)}
		{!showGame && (
			<div id="paddleselect">
				<label>
					<input type="radio" value="default" checked={selectedPaddle === 'default'} onChange={handleChange} />
					Radio 1
				</label>
				<label>
					<input type="radio" value="option1" checked={selectedPaddle === 'option1'} onChange={handleChange} />
					<img className="button-image" src="/home/jvan-hal/Desktop/Transcendence/frontend/src/data/IMG20240920204934.jpg"></img>
					Radio 2
				</label>
				<label>
					<input type="radio" value="option2" checked={selectedPaddle === 'option2'} onChange={handleChange} />
					<img className="button-image" src="/home/jvan-hal/Desktop/Transcendence/frontend/src/data/IMG20241210093625.jpg"></img>
					Radio 3
				</label>
			</div>
		)}
	</div> 
  );
};

export default PaddleSelect;
