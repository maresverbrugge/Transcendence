// Game page that is shown when the user goes to localhost:3000/game

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import GameControl from '../components/Game/GameControl.tsx';

const Game = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [tempToken, setTempToken] = useState<string | null>(null); //tijdelijke oplossing voor Token
	const [games, setGames] = useState<Match[] | null>([]);
	const [selectedGame, setSelectedGame] = useState<number | null>(null);
    
    useEffect(() => {
        //because dev mode sometimes didnt disconnect old sockets
        if (socket) {
			socket.disconnect(); // Disconnect existing socket if any
            console.log('Previous socket disconnected');
        }
        
        // Initialize socket connection
		const token: string = localStorage.getItem('token');
        const socketIo: Socket = io('http://localhost:3001/game', {
			transports: ['websocket', 'polling'],
            query: { token: token } // Hier de token uit localstorage halen
        });

		//temporary replacing token for websocketID for testing
        socketIo.on('token', (websocketID: string) => {
            setTempToken(websocketID);
            console.log('replaced token with websocketID')
        })
		
        // Set socket instance in state
        setSocket(socketIo);

		const fetchGames = async () => {
            try {
                const response: AxiosResponse<Match[]> = await axios.get(`http://localhost:3001/game/matches`);
                setGames(response.data);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };
    
        fetchGames();
		
		socketIo.on('newGame', (data: any) => {
			setGames((prevGames) => prevGames.concat(data.game));
			if (confirm(`game ${data.game.matchID} is looking for another player, join?`)) {
				setSelectedGame(data.game.matchID);
			} else {
				// sent inviteDecline en dan pop up op andere frontend?
			}
		});

        return () => {
			socketIo.off('newGame');
			socketIo.off('token');
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
    }, [])

	const handleSelectGame = (gameID: number) => {
		socket.emit('acceptGame', gameID, socket.id);
		setSelectedGame(gameID);
	}

	const createNewGame = (socket: Socket) => {
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
					<GameControl gameID={selectedGame} socket={socket}/>
				) : (
					<p>Select or create a game to play.</p>
				)}
			</div>
		</div>
    )
}

export default Game;
