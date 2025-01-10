// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// import { emitter } from '../emitter'; // not final place

import GameControl from './GameControl';

const PaddleSelect = ({}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPaddle, setSelectedPaddle] = useState<string>("default");
  const [showGame, setShowGame] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
	setToken(token);
    const socketIo: Socket = io('{process.env.REACT_APP_URL_BACKEND}/game', {
      transports: ['websocket'],
      query: { token }, // Hier de token uit localstorage halen
    });

	socketIo.on('connect_error', (error) => {
		console.error('Connection Error:', error.message);
	  });

    // Set socket instance in state
    setSocket(socketIo);

	socketIo.on('error', (gameID: number) => {
		// emitter.emit('error', error);
	  });

    return () => {
	  socketIo.off('error');
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
			<GameControl socket={socket} skin={selectedPaddle} token={token} />
		)}
		{!showGame && (
			<div id="paddleselect">
				<label>
					<input type="radio" value="default" checked={selectedPaddle === 'default'} onChange={handleChange} />
					Radio 1
				</label>
				<label>
					<input type="radio" value="option1" checked={selectedPaddle === 'option1'} onChange={handleChange} />
					<img className="button-image" src="http://localhost:3001/images/pexels-lum3n-44775-406014.jpg"></img>
					Radio 2
				</label>
				<label>
					<input type="radio" value="option2" checked={selectedPaddle === 'option2'} onChange={handleChange} />
					<img className="button-image" src="http://localhost:3001/images/pexels-pixabay-259915.jpg"></img>
					Radio 3
				</label>
			</div>
		)}
	</div> 
  );
};

export default PaddleSelect;
