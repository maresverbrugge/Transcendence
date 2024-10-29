import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
<<<<<<< Updated upstream
// import GameApp from './pages/game';
// import LoginPage from './pages/login';
// import LoginRedirect from './components/LoginRedirect';
import Chat from './pages/Chat'
=======
import Userlist from './components/Userlist';
import Channels from './components/Channels'
import Game from './pages/game';
//import LoginPage from './pages/login';
//import LoginRedirect from './components/LoginRedirect';
>>>>>>> Stashed changes

const App = () => {
	const [chatSocket, setChatSocket] = useState(null);
	const [gameSocket, setGameSocket] = useState(null);

	useEffect(() => {
		//because dev mode sometimes didnt disconnect old sockets
		if (chatSocket) {
			chatSocket.disconnect(); // Disconnect existing socket if any
			console.log('Previous socket disconnected');
		}
		if (gameSocket) {
			gameSocket.disconnect(); // Disconnect existing socket if any
			console.log('Previous socket disconnected');
		}

		// Initialize socket connection
		const chatSocketIo = io('http://localhost:3001/chat', {
          transports: ['websocket']
        });
		const gameSocketIo = io('http://localhost:3001/game', {
			transports: ['websocket']
		  });

		// Set socket instance in state
		setChatSocket(chatSocketIo);
		setGameSocket(gameSocketIo);

		return () => {
            chatSocketIo.disconnect(); // Disconnect the socket when the component unmounts
			gameSocketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
	}, [])

	if (!chatSocket || !gameSocket) { return }
	return (
        <div>
<<<<<<< Updated upstream
            <Chat />
            {/* <GameApp /> */}
            {/* <LoginPage /> */}
            {/* <LoginRedirect /> */}
=======
            <Userlist socket={chatSocket} />
			      <Channels socket={chatSocket} />
            {/* <Game socket={gameSocket}/> */}
            {/* <LoginPage />
            <LoginRedirect /> */}
>>>>>>> Stashed changes
        </div>
    );
}

export default App;