import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Channels from '../components/chat/channels/Channels';
import AlertMessage from '../components/AlertMessage';
import ChatInfo from '../components/chat/chatInfo/ChatInfo';
import Messenger from '../components/chat/messenger/Messenger';

const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [tempToken, setTempToken] = useState(null); //tijdelijke oplossing voor Token
    const [error, setError] = useState(null)
    const [channel, setChannel] = useState(null)
    const [friends, setFriends] = useState([])
    
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
            console.log('replaced token with websocketID: ', websocketID)
        })

        socketIo.on('error', (error) => {
            setError(error)
        })

        // Set socket instance in state
        setSocket(socketIo);

        return () => {
            socketIo.disconnect(); // Disconnect the socket when the component unmounts
        };
    }, [])

    if (error)
        console.error(error)
    
    if (!socket || !tempToken) return
    return (
        <div>
            {error && (<AlertMessage message={error.response.message} onClose={()=> {setError(null)}} />)}
            <Channels  slectedChannel={channel} setSelectedChannel={setChannel} friends={friends} socket={socket} token={tempToken}/>
            <Messenger channel={channel} socket={socket} token={tempToken}/>
            <ChatInfo channel={channel} setChannel={setChannel} friends={friends} setFriends={setFriends} socket={socket} token={tempToken}/>
        </div>
    )
}

export default Chat