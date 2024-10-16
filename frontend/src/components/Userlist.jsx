// Userlist Component
import React, { useState, useEffect } from 'react';
import './Userlist.css';


const sendChannelInvite = (socket, memberId) => {
    socket.emit('channelInvite', memberId);
};

const Userlist = ({ socket }) => {
    
    const [userlist, setUserlist] = useState([])
    
    useEffect(() => {
        socket.on('users', (users) => setUserlist(users))
        socket.on('userOnline', (user) => setUserlist((prevUserList) => prevUserList.concat(user)))
        socket.on('userOffline', (user) => setUserlist((prevUserList) => prevUserList.filter((prevUser) => prevUser.username !== user.username)))
        socket.on('channelInvite', (data) => {
            if (confirm(`${data.ownerUsername} has sent you a channel invitation`)) {
                socket.emit('acceptChannelInvite', data)
            } else {
                // sent inviteDecline en dan pop up op andere frontend?
            }
        });
        
        socket.emit('getUsers');
        
        return () => {
            socket.off('users');
            socket.off('userOnline');
            socket.off('userOffline');
            socket.off('channelInvite');
        }

    }, []);
    
    return (
      <div className="userlist-container">
          <h1>Online:</h1>
          <ul className="userlist">
              {userlist.map((user) => (
                  user.websocketId !== socket.id && (
                      <li key={user.id}>
                          {user.username}
                          <button onClick={() => sendChannelInvite(socket, user.id)}>Invite</button>
                      </li>
                  )
              ))}
          </ul>
      </div>
  );    
};

export default Userlist;