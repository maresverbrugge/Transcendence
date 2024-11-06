import React, { useState, useEffect } from 'react';
import './Channel.css'; // Import the CSS file
import AlertMessage from './AlertMessage';
import Confirm from './Confirm';

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
            socket.off('youAreMuted')
            socket.emit('leaveChannel', channel.id);
        };
    }, [channel]);

    const sortedMembers = members.sort((a, b) => {
        // Sort by owner, then admins, then others
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        if (a.isAdmin && !b.isAdmin) return -1;
        if (b.isAdmin && !a.isAdmin) return 1;
        return 0;
    });

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

    const handleConfirmOK = () => {
        if (confirmAction && selectedMemberID) {
            switch (confirmAction) {
                case "demote":
                    handleDemoteAdmin(selectedMemberID);
                    break;
                case "makeAdmin":
                    handleMakeAdmin(selectedMemberID);
                    break;
                case "mute":
                    handleMute(selectedMemberID);
                    break;
                case "kick":
                    handleKick(selectedMemberID);
                    break;
                case "ban":
                    handleBan(selectedMemberID);
                    break;
                default:
                    break;
            }
        }
        setShowConfirm(false);
    };

    const handleConfirmCancel = () => setShowConfirm(false);
    const handleDemoteAdmin = (userID) => {
        console.log('handleDemoteAdmin called')
    }
    const handleMakeAdmin = (userID) => {
        console.log('handleMakeAdmin called')
    }
    const handleMute = (userID) => {
        console.log('handleMute Called')
    }
    const handleKick = (userID) => {
        console.log('handleKick called')
    }
    const handleBan = (userID) => {
        console.log('handleBan called')
    }

    return (
        <div className="channel-container">
            {showMutedAlert && (<AlertMessage message="You are muted in this channel." onClose={handleCloseMutedAlert} />)}

            <div className="channel-header">
                <h2>Channel: {channel.name}</h2>
                <ul>
                    {sortedMembers.map((member) => {
                        const isCurrentUser = member.user.id === currentUserChannelMember.userId;
                        const roleLabel = member.isOwner
                            ? "Owner"
                            : member.isAdmin
                            ? "Admin"
                            : "";
                        return (
                            <li key={member.id}>
                                {isCurrentUser
                                    ? `You${roleLabel ? ` (${roleLabel})` : ""}`
                                    : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ""}`}

                                <div className="actions">
                                    {currentUserChannelMember.isOwner && !member.isOwner && (
                                        <>
                                            {member.isAdmin ? (
                                                <button onClick={() => handleActionClick("demote", member.id)}>Demote Admin</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleActionClick("makeAdmin", member.id)}>Make Admin</button>
                                                    <button onClick={() => handleActionClick("mute", member.id)}>Mute</button>
                                                    <button onClick={() => handleActionClick("kick", member.id)}>Kick</button>
                                                    <button onClick={() => handleActionClick("ban", member.id)}>Ban</button>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Admins see options for non-admin members */}
                                    {currentUserChannelMember.isAdmin && !currentUserChannelMember.isOwner && !member.isAdmin && !member.isOwner && (
                                        <>
                                            <button onClick={() => handleActionClick("mute", member.id)}>Mute</button>
                                            <button onClick={() => handleActionClick("kick", member.id)}>Kick</button>
                                            <button onClick={() => handleActionClick("ban", member.id)}>Ban</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div>
            {showConfirm && (
                <Confirm
                    message={confirmMessageMap[confirmAction]}
                    onOK={handleConfirmOK}
                    onCancel={handleConfirmCancel}
                />
            )}
            </div>
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

export default Channel