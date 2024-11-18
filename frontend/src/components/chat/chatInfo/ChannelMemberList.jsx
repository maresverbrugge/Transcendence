import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Confirm from '../../Confirm';


const ChannelMemberList = ({channel, setChannel, token, socket }) => {
    const [members, setMembers] = useState(channel.members);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedMemberID, setSelectedMemberID] = useState(null);
    const [memberID, setMemberID] = useState(null)
    useEffect(() => {
        const fetchCurrentMemberID = async (channelID, token) => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/memberID/${channelID}/${token}`);
                setMemberID(response.data);
            } catch (error) {
                console.error('Error fetching current channelMemberID:', error);
            }
        };
    
        fetchCurrentMemberID(channel.id, token);

        const handleIncomingMember = (incomingMember) => {
            setMembers((prevMembers) => {
                const memberExists = prevMembers.some(member => member.id === incomingMember.id);
                if (memberExists) {
                    return prevMembers.map((member) =>
                        member.id === incomingMember.id ? incomingMember : member
                    );
                }
                return [...prevMembers, incomingMember];
            });
        };
    
        socket.on('channelMember', (incomingMember) => {
            console.log(incomingMember, currentMember)
            handleIncomingMember(incomingMember)
        });
    
        return () => {
            socket.off('channelMember');
        };
    }, []);
    
    const currentMember = members.find(member => member.id === memberID);
    if (currentMember?.isBanned)
        setChannel(null)

    // Sort members based on their roles
    const sortedMembers = members.sort((a, b) => {
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

    const handleActionClick = (action, memberID) => {
        setConfirmAction(action);
        setSelectedMemberID(memberID);
        setShowConfirm(true);
    };

    const handleAction = () => {
        socket.emit('channelAction', {action: confirmAction, channelMemberID: selectedMemberID, token, channelID: channel.id });
        setShowConfirm(false);
    };

    const handleConfirmCancel = () => setShowConfirm(false);

    const renderActionButtons = (memberId) => (
        <>
            <button onClick={() => handleActionClick("mute", memberId)}>Mute</button>
            <button onClick={() => handleActionClick("kick", memberId)}>Kick</button>
            <button onClick={() => handleActionClick("ban", memberId)}>Ban</button>
        </>
    );

    return (
        <div>
            {showConfirm && (
                <Confirm
                    message={confirmMessageMap[confirmAction]}
                    onOK={handleAction}
                    onCancel={handleConfirmCancel}
                />
            )}
            <ul>
                {sortedMembers.map((member) => {
                    if (member.isBanned)
                        return null;
                    const isCurrentMember = currentMember && member.id === currentMember.id;
                    const roleLabel = member.isOwner
                        ? "Owner"
                        : member.isAdmin
                        ? "Admin"
                        : "";
                    return (
                        <li key={member.id}>
                            {isCurrentMember
                                ? `You${roleLabel ? ` (${roleLabel})` : ""}`
                                : `${member.user.username}${roleLabel ? ` (${roleLabel})` : ""}`}

                            <div className="actions">
                                {currentMember?.isOwner && !member.isOwner && (
                                    <>
                                        {member.isAdmin ? (
                                            <button onClick={() => handleActionClick("demote", member.id)}>Demote Admin</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleActionClick("makeAdmin", member.id)}>Make Admin</button>
                                                {renderActionButtons(member.id)}
                                            </>
                                        )}
                                    </>
                                )}
                                {currentMember?.isAdmin && !currentMember?.isOwner && !member.isAdmin && !member.isOwner && (
                                    renderActionButtons(member.id)
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChannelMemberList;
