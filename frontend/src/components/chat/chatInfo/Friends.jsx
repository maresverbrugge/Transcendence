// Userlist Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Friends.css';


// const sendChannelInvite = (socket, memberId) => {
//     socket.emit('channelInvite', memberId);
// };

const Friend = ({ friend, socket }) => {
    const [status, setStatus] = useState('friend-offline')

    useEffect(() => {
        const getStatusClass = (userStatus) => {
            switch (userStatus) {
                case 'ONLINE':
                    return 'friend-online';
                case 'OFFLINE':
                    return 'friend-offline';
                case 'IN_GAME':
                    return 'friend-ingame';
                case 'AFK':
                    return 'friend-afk';
            }
        };

        socket.on('userStatusChange', (userID, userStatus) => {
            if (friend.id === userID)
                setStatus(getStatusClass(userStatus))
        })
        

        setStatus(getStatusClass(friend.status))

        return () => {
            socket.off('userStatusChange')
        }

    }, [])

    return (
        <li className={status}>
            {friend.username}
        </li>
    );
};

const Friends = ({friends, setFriends, socket, token }) => {
    
    
    useEffect(() => {
        
        const fetchFriends = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/friends/${token}`);
                if (response.data)
                    setFriends(response.data);
            } catch (error) {
                if (error.response && error.response.status === 404)
                  console.error("User not found");
                else
                  console.error("An error occurred", error);
            };
        }
    
        fetchFriends();

    }, []);

    
    return (
        <div className="friends-container">
            <h1>Friends</h1>
            <ul className="friends">
                {friends.map((friend) => (
                    <Friend
                        key={friend.id}
                        friend={friend}
                        socket={socket}
                    />
                ))}
            </ul>
        </div>
    );   
};

export default Friends;