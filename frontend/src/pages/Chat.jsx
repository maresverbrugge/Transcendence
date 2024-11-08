import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Channels from '../components/Channels';
import Friends from '../components/Friends';


const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [tempToken, setTempToken] = useState(null); //tijdelijke oplossing voor Token
    
    useEffect(() => {
        // Initialize socket connection
        const token = localStorage.getItem('token');
        const socketIo = io('http://localhost:3001/chat', {
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
    
    if (!socket || !tempToken) return
    return (
        <div>
            <Channels socket={socket} token={tempToken}/>
            <Friends socket={socket} token={tempToken}/>
        </div>
    )
}

export default Chat