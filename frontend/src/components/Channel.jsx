import React, { useState, useEffect } from 'react';
import './Channel.css';
import AlertMessage from './AlertMessage';
import Confirm from './Confirm';
import ChannelMemberList from './ChannelMemberList'; // Import the new ChannelMemberList component

const Channel = ({ channel, socket, token, currentUserChannelMember }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showMutedAlert, setShowMutedAlert] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedMemberID, setSelectedMemberID] = useState(null);

    useEffect(() => {
        socket.emit('joinChannel', channel.id);
        setMembers(channel.members);

        socket.on('newMessage', (message) => {
            if (message?.channelID === channel.channelID) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        socket.on('youAreMuted', () => {
            setShowMutedAlert(true);
        });

        return () => {
            socket.off('newMessage');
            socket.off('youAreMuted');
            socket.emit('leaveChannel', channel.id);
        };
    }, [channel]);

    const confirmMessageMap = {
        demote: "Are you sure you want to demote this admin?",
        makeAdmin: "Are you sure you want to make this user an admin?",
        mute: "Are you sure you want to mute this user?",
        kick: "Are you sure you want to kick this user?",
        ban: "Are you sure you want to ban this user?",
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            socket.emit('sendMessage', { channelID: channel.id, ownerToken: token, content: newMessage });
            setNewMessage('');
        }
    };

    const handleCloseMutedAlert = () => setShowMutedAlert(false);

    const handleActionClick = (action, memberID) => {
        setConfirmAction(action);
        setSelectedMemberID(memberID);
        setShowConfirm(true);
    };

    const handleAction = () => {
        socket.emit(confirmAction, { targetUserID: selectedMemberID, token, channelID: channel.id });
        setShowConfirm(false);
    };

    const handleConfirmCancel = () => setShowConfirm(false);

    return (
        <div className="channel-container">
            {showMutedAlert && (<AlertMessage message="You are muted in this channel." onClose={handleCloseMutedAlert} />)}

            <div className="channel-header">
                <h2>Channel: {channel.name}</h2>
                <ChannelMemberList
                    initialMembers={members}
                    currentUserChannelMember={currentUserChannelMember}
                    handleActionClick={handleActionClick}
                    socket={socket}
                />
            </div>

            {showConfirm && (
                <Confirm
                    message={confirmMessageMap[confirmAction]}
                    onOK={handleAction}
                    onCancel={handleConfirmCancel}
                />
            )}

            <div className="channel-messages">
                <ul>
                    {messages.map((message) => (
                        <li key={message.id}>
                            <strong>{message.senderName}: </strong>
                            {message.content}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="channel-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Channel;
