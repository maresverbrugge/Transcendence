import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserList from './components/UserList';
import Channels from './components/Channels'

const App = () => {
	const [socket, setSocket] = useState(null);
	const [userList, setUserList] = useState([]);
	const [channels, setChannels]  = useState([])

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

		socketIo.on('users', (users) => setUserList(users))

		socketIo.on('userOnline', (user) => {
			if (user.username !== socketIo.id) {
				setUserList((prevUserList) => prevUserList.concat(user));
			}
		});

		socketIo.on('userOffline', (user) => {
			setUserList((prevUserList) => 
				prevUserList.filter((prevUser) => prevUser.username !== user.username)
			);
		});

		socketIo.on('chatInvite', (data) => {
			console.log('recieved')
			if (confirm(`${data.owner} has sent you a chat invitation`)) {
				socketIo.emit('acceptChatInvite', data)
			} else {
				// sent inviteDecline en dan pop up op andere frontend?
			}
		});

		socketIo.on('newChannel', (channel) => {
			setChannels((prevChannels) => prevChannels.concat(channel))
		})

		return () => {
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
	}, [])

	// Function to send chat invite
    const sendChatInvite = (memberUsername) => {
        socket.emit('chatInvite', memberUsername);
    };

	return (
        <div>
            <UserList userList={userList} sendChatInvite={sendChatInvite} />
			<Channels channels={channels} socket={socket} />
        </div>
    );}

export default App;
