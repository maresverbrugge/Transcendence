// Game page that is shown when the user goes to localhost:3000/game

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import GameLogic from '../components/GameLogic';

const Game = () => {
	const [socket, setSocket] = useState(null);
	const [tempToken, setTempToken] = useState(null); //tijdelijke oplossing voor Token
	const [games, setGames] = useState([]);
	const [selectedGame, setSelectedGame] = useState(null);
    
    useEffect(() => {
        //because dev mode sometimes didnt disconnect old sockets
        if (socket) {
			socket.disconnect(); // Disconnect existing socket if any
            console.log('Previous socket disconnected');
        }
        
        // Initialize socket connection
		const token = localStorage.getItem('token');
        const socketIo = io('http://localhost:3001/game', {
			transports: ['websocket', 'polling'],
            query: { token: token } // Hier de token uit localstorage halen
        });

		//temporary replacing token for websocketID for testing
        socketIo.on('token', (websocketID) => {
            setTempToken(websocketID);
            console.log('replaced token with websocketID')
        })
		
        // Set socket instance in state
        setSocket(socketIo);

		const fetchGames = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/game/matches`);
                setGames(response.data);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };
    
        fetchGames();
		
		socketIo.on('newGame', (data) => {
			setGames((prevGames) => prevGames.concat(data.game));
			if (confirm(`game ${data.game.matchID} is looking for another player, join?`)) {
				setSelectedGame(data.game.matchID);
				socketIo.emit('acceptGame', data.game.matchID);
			} else {
				// sent inviteDecline en dan pop up op andere frontend?
			}
		});

        return () => {
			socketIo.off('newGame');
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
    }, [])

	const handleSelectGame = (gameID) => {
		socket.emit('acceptGame', gameID);
		setSelectedGame(gameID);
	}

	const createNewGame = (socket) => {
		socket.emit('createNewGame', socket.id);
	}
    
    if (!socket) { return }

    return (
        <div className="games-startup">
			{/* List of games */}
			<div className="games-list">
			{selectedGame ? (
				<p></p>
				) : (
					<div className="games-container">
						<h2>Available games</h2>
						<ul>
							{games.map((game) => (
								<li key={game.matchID}>
									<button onClick={() => handleSelectGame(game.matchID)}>
										{`game ${game.matchID}`} {/* Display game id */}
									</button>
								</li>
							))}
						</ul>
						<button onClick={() => createNewGame(socket)}>
							{`create a new game`}
						</button>
					</div>
				)}
			</div>

			{/* Display selected game */}
			<div className="game-details">
				{selectedGame ? (
					<GameLogic gameID={selectedGame} socket={socket}/>
				) : (
					<p>Select or create a game to play.</p>
				)}
			</div>
		</div>
    )
}

export default Game;
