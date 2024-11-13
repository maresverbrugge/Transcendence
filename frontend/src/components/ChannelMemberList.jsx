import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Confirm from './Confirm';


const ChannelMemberList = ({channel, token, socket }) => {
    const [members, setMembers] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedMemberID, setSelectedMemberID] = useState(null);
    const [currentMember, setCurrentMember] = useState(null);

    useEffect(() => {

        setMembers(channel.members);

        const fetchCurrentMember = async (channelID, token) => {
            try {
                const response = await axios.get(`http://localhost:3001/chat/channel/member/${channelID}/${token}`);
                setCurrentMember(response.data)
            } catch (error) {
                console.error('Error fetching current channelMember:', error);
                setCurrentMember(null)
            }
        };

        fetchCurrentMember(channel.id, token)

        socket.on('channelMember', (incomingMember) => {
            setMembers((prevMembers) => {
                if (currentMember && incomingMember.id === currentMember.id) {
                    setCurrentMember(incomingMember);
                }
                const memberExists = prevMembers.some(member => member.id === incomingMember.id);
                if (memberExists)
                    return prevMembers.map((member) =>
                        member.id === incomingMember.id ? incomingMember : member
                    );
                else
                    return [...prevMembers, incomingMember];
            });
        });

        return () => {
            socket.off('channelMember');
        };

    },[] );

    if (!members)
        return

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
                    const isCurrentUser = currentMember && member.userId === currentMember.userId;
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
