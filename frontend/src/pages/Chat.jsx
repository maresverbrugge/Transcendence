import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import LoginPage from './login'
import Channels from '../components/Channels';
import Friends from '../components/Friends';


const Chat = () => {
    const [socket, setSocket] = useState(null);
    
    useEffect(() => {
        //because dev mode sometimes didnt disconnect old sockets
        if (socket) {
            socket.disconnect(); // Disconnect existing socket if any
            console.log('Previous socket disconnected');
        }
        
        // Initialize socket connection
        const socketIo = io('http://localhost:3001/chat', {
            transports: ['websocket', 'polling'],
            query: { token: 'your_jwt_token' } // Hier de token uit localstorage halen
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
            <LoginPage />
            <Channels socket={socket} />
            <Friends socket={socket} />
        </div>
    )
}

export default Chat