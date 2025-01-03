// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import GameControl from './GameControl';

const PaddleSelect = ({ socket }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPaddle, setSelectedPaddle] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null); //tijdelijke oplossing voor Token
  const [gameID, setGameID] = useState<number>(-1);
  const [showGame, setShowGame] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketIo: Socket = io('http://localhost:3001/game', {
      transports: ['websocket', 'polling'],
      query: { token: token }, // Hier de token uit localstorage halen
    });

    //temporary replacing token for websocketID for testing
    socketIo.on('token', (websocketID: string) => {
      setTempToken(websocketID);
      console.log('replaced token with websocketID');
    });

    // Set socket instance in state
    setSocket(socketIo);
    socketIO.emit('getGameID', tempToken);
    socketIo.on('gameID', (gameID: number) => {
      setGameID(gameID);
    });

    return () => {
      socketIo.off('token');
      socketIo.off('getGameID');
  };
  }, []);

    const selectPaddle = () => {
      if(document.getElementById('btnradio1').checked){
 	setSelectedPaddle("Default");
      }
      else if(document.getElementById('btnradio2').checked){
 	setSelectedPaddle("option2");
      }
      else if(document.getElementById('btnradio3').checked){
	setSelectedPaddle("option3");
      }
      setShowGame(true);
   };

  return (
    {showGame && (
      <GameControl gameID={gameID} socket={socket} />
    )}
    {!showGame && (
      <div id="paddleselect">
	<input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked="true">
	<label class="btn btn-outline-primary" for="btnradio1">Radio 1</label>
	<input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked="">
	<label class="btn btn-outline-primary" for="btnradio2">Radio 2</label>
	<input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" checked="">
	<label class="btn btn-outline-primary" for="btnradio3">Radio 3</label>
        <button onClick={() => selectPaddle()}>{`Continue to game`}</button>
      </div>
    )}
  );
};

export default PaddleSelect;
