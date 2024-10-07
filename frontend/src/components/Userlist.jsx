// Userlist Component
import React, { useState, useEffect } from 'react';

const sendChatInvite = (socket, memberUsername) => {
    socket.emit('chatInvite', memberUsername);
};

const Userlist = ({ socket }) => {
    
    const [userlist, setUserlist] = useState([])
    
    useEffect(() => {
        socket.on('users', (users) => setUserlist(users))
        socket.on('userOnline', (user) => setUserlist((prevUserList) => prevUserList.concat(user)))
        socket.on('userOffline', (user) => setUserlist((prevUserList) => prevUserList.filter((prevUser) => prevUser.username !== user.username)))
        socket.on('chatInvite', (data) => {
            if (confirm(`${data.owner} has sent you a chat invitation`)) {
                socket.emit('acceptChatInvite', data)
            } else {
                // sent inviteDecline en dan pop up op andere frontend?
            }
        });
        
        socket.emit('getUsers');
        
        return () => {
            socket.off('users');
            socket.off('userOnline');
            socket.off('userOffline');
            socket.off('chatInvite');
        }

    }, []);
    
    return (
        <div>
          <h1>Online:</h1>
          <ul>
            {userlist.map((user) => (
              user.websocketId !== socket.id && (
                <li key={user.id}>
                  {user.username}
                  <button onClick={() => sendChatInvite(socket, user.username)}>Send Chat Invite</button>
                </li>
              )
            ))}
          </ul>
        </div>
      );      
};

export default Userlist;