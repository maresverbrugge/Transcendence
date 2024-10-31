// Game page that is shown when the user goes to localhost:3000/game

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import GameLogic from '../components/GameLogic';

const Game = () => {
	const [socket, setSocket] = useState(null);
	const [games, setGames] = useState([]);
	const [selectedGame, setSelectedGame] = useState(null);
    
    useEffect(() => {
        //because dev mode sometimes didnt disconnect old sockets
        if (socket) {
			socket.disconnect(); // Disconnect existing socket if any
            console.log('Previous socket disconnected');
        }
        
        // Initialize socket connection
        const socketIo = io('http://localhost:3001/game', {
			transports: ['websocket', 'polling'],
            query: { token: 'your_jwt_token' } // Hier de token uit localstorage halen
        });
		
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
			if (confirm(`game ${data.gameId} is looking for another player, join?`)) {
				console.log('accepted');
				setSelectedGame(data.gameId);
				socketIo.emit('acceptGame', data.gameId);
			} else {
				// sent inviteDecline en dan pop up op andere frontend?
			}
		});

        return () => {
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
    }, [])

	const handleSelectGame = (gameId) => {
		setSelectedGame(gameId);
	}

	const createNewGame = (socket) => {
		socket.emit('createNewGame', socket.id);
	}
    
    if (!socket) { return }

    return (
        <div className="games-container">
			{/* List of games */}
			<div className="games-list">
				<h2>Available games</h2>
				<ul>
					{games.map((game) => (
						<li key={game.matchId}>
							<button onClick={() => handleSelectGame(game.matchId)}>
								{`game ${game.matchId}`} {/* Display game id */}
							</button>
						</li>
					))}
					<button onClick={() => createNewGame(socket)}>
						{`create a new game`}
					</button>
				</ul>
			</div>

			{/* Display selected game */}
			<div className="game-details">
				{selectedGame ? (
					<GameLogic game={selectedGame} socket={socket}/>
				) : (
					<p>Select or create a game to play.</p>
				)}
			</div>
		</div>
    )
}

export default Game;
