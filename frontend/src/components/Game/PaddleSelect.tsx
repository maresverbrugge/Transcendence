// Game page that is shown when the user goes to localhost:3000/game

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import GameControl from './GameControl';

const PaddleSelect = ({ gameID, socket }) => {
  const [selectedPaddle, setSelectedPaddle] = useState<string | null>(null);

  useEffect(() => {

    return () => { };
  }, []);

//   const selectPaddle = () => {
//     if(document.getElementById('btnradio1').checked){
// 		setSelectedPaddle("Default");
// 	}else if(document.getElementById('btnradio2').checked){
// 		setSelectedPaddle("option2");
// 	}else if(document.getElementById('btnradio3').checked){
// 		setSelectedPaddle("option3");
// 	}
//   };

  return (
	<GameControl gameID={gameID} socket={socket} />
    // <div className="games-startup">
    //   {/* Display selected game */}
    //   <div className="game-details">
    //     {selectedPaddle ?
	// 		<GameControl gameID={gameID} socket={socket} /> : <p></p>}
	// 		{/*  <div id="paddleselect">
	// 		 	<label for="paddle">Choose an image for your paddle</label>
	// 		 	<div id="paddle" class="btn-group" role="group" aria-label="Basic radio toggle button group">
	// 		 		<input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked="true">
	// 		 		<label class="btn btn-outline-primary" for="btnradio1">Radio 1</label>
	// 		 		<input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked="">
	// 		 		<label class="btn btn-outline-primary" for="btnradio2">Radio 2</label>
	// 		 		<input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" checked="">
	// 		 		<label class="btn btn-outline-primary" for="btnradio3">Radio 3</label>
	// 		 	</div>
	// 		 </div> */}
    //   </div>
    // </div>
  );
};

export default PaddleSelect;
