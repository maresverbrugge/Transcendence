import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Userlist from './components/Userlist';
import Channels from './components/Channels'

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
        </div>
    );}
	

export default App;
