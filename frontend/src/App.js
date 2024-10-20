import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import Userlist from './components/Userlist';
import Channels from './components/Channels'
import GameApp from './pages/game';
import LoginPage from './pages/login';
import LoginRedirect from './components/LoginRedirect';
import Login2FA from './components/Login2FA';

const App = () => {
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		//because dev mode sometimes didnt disconnect old sockets
		if (socket) {
			socket.disconnect(); // Disconnect existing socket if any
			console.log('Previous socket disconnected');
		}
		
		// Initialize socket connection
		const socketIo = io('http://localhost:3001', {
          transports: ['websocket', 'polling'],
        });
	
		// Set socket instance in state
		setSocket(socketIo);


		return () => {
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
	}, [])

	if (!socket) { return }
	return (
        <div>
            <Userlist socket={socket} />
			      <Channels socket={socket} />
            <LoginPage />
            <GameApp />
        </div>,

		<Router>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/game" element={<GameApp />} />
				<Route path="/login/redirect" element={<LoginRedirect />} />
				<Route path="/login/2fa" element={<Login2FA />} />
			</Routes>
		</Router>
    );}
	

export default App;