// Userlist Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Friends.css';
import NewChannel from './NewChannel';


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
            if (friend.id === userID) {
                setStatus(getStatusClass(userStatus))
            }
        })
        

        setStatus(getStatusClass(friend.status))

        return () => {
            socket.off('userStatus')
        }

    }, [])

    return (
        <li className={status}>
            {friend.username}
            {/* <button onClick={() => sendChannelInvite(socket, feriend.id)}>Invite</button> */}
        </li>
    );
};

const Friends = ({ socket }) => {
    
    const [friendlist, setFriendlist] = useState([])

    
    useEffect(() => {
        
        const userID = '1'; //userID ergens vandaan halen! misschien via localstorage acces token?
        const fetchFriends = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/friends/${userID}`);
                if (response.data) {
                    setFriendlist(response.data);
                }
            } catch (error) {
                if (error.response.status === 404) {
                  console.error("User not found");
                  // Handle user not found
                } else {
                  console.error("An error occurred", error);
                  // Handle other errors
                }
            };
        }
    
        fetchFriends();


        // socket.on('userOnline', (userID) => setFriendlist((prevFriendlist) => prevFriendlist.concat(user)))
        // socket.on('userOffline', (userID) => setFriendlist((prevFriendlist) => prevFriendlist.filter((prevUser) => prevUser.username !== user.username)))
        // socket.on('channelInvite', (data) => {
        //     if (confirm(`${data.ownerUsername} has sent you a channel invitation`)) {
        //         socket.emit('acceptChannelInvite', data)
        //     } else {
        //         // sent inviteDecline en dan pop up op andere frontend?
        //     }
        // });        
        return () => {
            // socket.off('userOnline');
            // socket.off('userOffline');
            // socket.off('channelInvite');
        }

    }, []);

    
    return (
        <div className="friendlist-container">
            <h1>Friends</h1>
            <ul className="friendlist">
                {friendlist.map((friend) => (
                    <Friend
                        key={friend.id}
                        friend={friend}
                        socket={socket}
                    />
                ))}
            </ul>
            <NewChannel friendList={friendlist} socket={socket} />
        </div>
    );   
};

export default Friends;