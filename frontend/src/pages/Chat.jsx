import Channels from '../components/Chat/Channels';
import Friends from '../components/Chat/Friends';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const Chat = () => {
    
    const [socket, setSocket] = useState(null);
    const [tempToken, setTempToken] = useState(null); //tijdelijke oplossing voor Token
    
    useEffect(() => {
        //because dev mode sometimes didnt disconnect old sockets
        if (socket) {
            socket.disconnect(); // Disconnect existing socket if any
            console.log('Previous socket disconnected');
        }
        
        // Initialize socket connection
        const token = localStorage.getItem('token');
        const socketIo = io('http://localhost:3001', {
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

        return () => {
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
    }, [])

	if (!socket) return null;
    
    return (
        <div>
            <Channels socket={socket} token={tempToken}/>
            <Friends socket={socket} token={tempToken}/>
        </div>
    )
}

export default Chat